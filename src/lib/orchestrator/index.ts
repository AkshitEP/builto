import { v4 as uuidv4 } from "uuid";
import {
    ValidatorAgent,
    PlannerAgent,
    TechAgent,
    BusinessAgent,
    DeveloperAgent,
    AgentContext,
    AgentOutput,
    AgentStatus,
} from "../agents";
import { PriorityQueue, StartupIdea, StartupStatus, calculatePriorityScore } from "./priority-queue";
import { StateMachine } from "./state-machine";

export interface StartupPipeline {
    idea: StartupIdea;
    stateMachine: StateMachine;
    outputs: Record<string, AgentOutput>;
    currentAgent: string | null;
    agentStatus: AgentStatus | null;
    error: string | null;
}

export interface ApprovalRequest {
    ideaId: string;
    agent: string;
    prompt: string;
    output: AgentOutput;
    createdAt: Date;
}

export type OrchestratorEvent =
    | { type: "idea_added"; idea: StartupIdea }
    | { type: "agent_started"; ideaId: string; agent: string }
    | { type: "agent_status"; ideaId: string; agent: string; status: AgentStatus }
    | { type: "agent_completed"; ideaId: string; agent: string; output: AgentOutput }
    | { type: "approval_requested"; request: ApprovalRequest }
    | { type: "approval_resolved"; ideaId: string; approved: boolean }
    | { type: "pipeline_completed"; ideaId: string }
    | { type: "pipeline_error"; ideaId: string; error: string };

export type EventCallback = (event: OrchestratorEvent) => void;

export class Orchestrator {
    private queue: PriorityQueue;
    private pipelines: Map<string, StartupPipeline>;
    private approvalQueue: ApprovalRequest[];
    private agents: {
        validator: ValidatorAgent;
        planner: PlannerAgent;
        tech: TechAgent;
        business: BusinessAgent;
        developer: DeveloperAgent;
    };
    private eventCallbacks: EventCallback[];
    private maxConcurrent: number;
    private isRunning: boolean;

    constructor(maxConcurrent: number = 3) {
        this.queue = new PriorityQueue();
        this.pipelines = new Map();
        this.approvalQueue = [];
        this.eventCallbacks = [];
        this.maxConcurrent = maxConcurrent;
        this.isRunning = false;

        // Initialize agents
        this.agents = {
            validator: new ValidatorAgent(),
            planner: new PlannerAgent(),
            tech: new TechAgent(),
            business: new BusinessAgent(),
            developer: new DeveloperAgent(),
        };
    }

    // Subscribe to orchestrator events
    subscribe(callback: EventCallback): () => void {
        this.eventCallbacks.push(callback);
        return () => {
            const index = this.eventCallbacks.indexOf(callback);
            if (index > -1) {
                this.eventCallbacks.splice(index, 1);
            }
        };
    }

    private emit(event: OrchestratorEvent): void {
        this.eventCallbacks.forEach((cb) => cb(event));
    }

    // Add a new startup idea
    addIdea(title: string, description: string, priorityHint?: number): StartupIdea {
        const idea: StartupIdea = {
            id: uuidv4(),
            title,
            description,
            status: "queued",
            priority: priorityHint || 50,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const priorityScore = calculatePriorityScore(idea, undefined, priorityHint);
        this.queue.enqueue(idea, priorityScore);

        // Create pipeline
        this.pipelines.set(idea.id, {
            idea,
            stateMachine: new StateMachine("queued"),
            outputs: {},
            currentAgent: null,
            agentStatus: null,
            error: null,
        });

        this.emit({ type: "idea_added", idea });
        return idea;
    }

    // Get all ideas with their current state
    getAllIdeas(): StartupPipeline[] {
        return Array.from(this.pipelines.values());
    }

    // Get pending approval requests
    getPendingApprovals(): ApprovalRequest[] {
        return [...this.approvalQueue];
    }

    // Handle approval decision
    async handleApproval(ideaId: string, approved: boolean): Promise<void> {
        const pipeline = this.pipelines.get(ideaId);
        if (!pipeline) return;

        // Remove from approval queue
        const requestIndex = this.approvalQueue.findIndex((r) => r.ideaId === ideaId);
        if (requestIndex > -1) {
            this.approvalQueue.splice(requestIndex, 1);
        }

        this.emit({ type: "approval_resolved", ideaId, approved });

        if (approved) {
            // Transition to next state
            pipeline.stateMachine.transition("approve");
            pipeline.idea.status = pipeline.stateMachine.getState();
            pipeline.idea.updatedAt = new Date();

            // Continue processing
            await this.processIdea(ideaId);
        } else {
            // Handle rejection based on current state
            const state = pipeline.stateMachine.getState();
            if (state === "validation_review") {
                pipeline.stateMachine.transition("reject");
                pipeline.idea.status = "rejected";
            } else {
                // For other reviews, transition back to redo the work
                pipeline.stateMachine.transition("reject");
                pipeline.idea.status = pipeline.stateMachine.getState();
                // Re-process with same agent
                await this.processIdea(ideaId);
            }
        }
    }

    // Pause an idea
    pauseIdea(ideaId: string): boolean {
        const pipeline = this.pipelines.get(ideaId);
        if (!pipeline) return false;

        if (pipeline.stateMachine.canTransition("pause")) {
            pipeline.stateMachine.transition("pause");
            pipeline.idea.status = "paused";
            pipeline.idea.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Resume a paused idea
    async resumeIdea(ideaId: string): Promise<boolean> {
        const pipeline = this.pipelines.get(ideaId);
        if (!pipeline) return false;

        if (pipeline.stateMachine.canTransition("resume")) {
            pipeline.stateMachine.transition("resume");
            pipeline.idea.status = pipeline.stateMachine.getState();
            pipeline.idea.updatedAt = new Date();
            await this.processIdea(ideaId);
            return true;
        }
        return false;
    }

    // Process a single idea through its current stage
    async processIdea(ideaId: string): Promise<void> {
        const pipeline = this.pipelines.get(ideaId);
        if (!pipeline) return;

        const state = pipeline.stateMachine.getState();
        let agent: ValidatorAgent | PlannerAgent | TechAgent | BusinessAgent | DeveloperAgent | null = null;
        let agentName = "";

        // Determine which agent to run based on state
        switch (state) {
            case "queued":
                pipeline.stateMachine.transition("start");
                pipeline.idea.status = "validating";
                agent = this.agents.validator;
                agentName = "validator";
                break;
            case "planning":
                agent = this.agents.planner;
                agentName = "planner";
                break;
            case "tech_design":
                agent = this.agents.tech;
                agentName = "tech";
                break;
            case "business_strategy":
                agent = this.agents.business;
                agentName = "business";
                break;
            case "developing":
                agent = this.agents.developer;
                agentName = "developer";
                break;
            default:
                return; // No agent needed for this state
        }

        if (!agent) return;

        pipeline.currentAgent = agentName;
        this.emit({ type: "agent_started", ideaId, agent: agentName });

        // Set up status callback
        agent.setStatusCallback((status) => {
            pipeline.agentStatus = status;
            this.emit({ type: "agent_status", ideaId, agent: agentName, status });
        });

        // Create context
        const context: AgentContext = {
            ideaId,
            ideaTitle: pipeline.idea.title,
            ideaDescription: pipeline.idea.description,
            previousOutputs: Object.fromEntries(
                Object.entries(pipeline.outputs).map(([k, v]) => [k, v.data])
            ),
        };

        try {
            const output = await agent.execute(context);
            pipeline.outputs[agentName] = output;
            pipeline.currentAgent = null;

            this.emit({ type: "agent_completed", ideaId, agent: agentName, output });

            if (output.success) {
                // Transition to review state
                pipeline.stateMachine.transition("complete");
                pipeline.idea.status = pipeline.stateMachine.getState();
                pipeline.idea.updatedAt = new Date();

                // Update priority based on validation score if applicable
                if (agentName === "validator" && output.data) {
                    const validationData = output.data as { priorityScore?: number };
                    if (validationData.priorityScore) {
                        pipeline.idea.priority = validationData.priorityScore;
                    }
                }

                // Check if approval is needed
                if (output.requiresApproval && output.approvalPrompt) {
                    const request: ApprovalRequest = {
                        ideaId,
                        agent: agentName,
                        prompt: output.approvalPrompt,
                        output,
                        createdAt: new Date(),
                    };
                    this.approvalQueue.push(request);
                    this.emit({ type: "approval_requested", request });
                } else {
                    // Auto-approve and continue
                    pipeline.stateMachine.transition("approve");
                    pipeline.idea.status = pipeline.stateMachine.getState();

                    // Check if completed
                    if (pipeline.stateMachine.isComplete()) {
                        this.emit({ type: "pipeline_completed", ideaId });
                    } else {
                        // Continue to next agent
                        await this.processIdea(ideaId);
                    }
                }
            } else {
                pipeline.error = output.summary;
                this.emit({ type: "pipeline_error", ideaId, error: output.summary });
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            pipeline.error = errorMsg;
            pipeline.currentAgent = null;
            this.emit({ type: "pipeline_error", ideaId, error: errorMsg });
        }
    }

    // Start processing queued ideas
    async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        while (this.isRunning) {
            // Count currently active pipelines
            const activePipelines = Array.from(this.pipelines.values()).filter(
                (p) => p.currentAgent !== null
            );

            // Process more if under limit
            while (activePipelines.length < this.maxConcurrent && !this.queue.isEmpty()) {
                const idea = this.queue.dequeue();
                if (idea) {
                    this.processIdea(idea.id); // Don't await - run in parallel
                }
            }

            // Wait before checking again
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    // Stop processing
    stop(): void {
        this.isRunning = false;
    }
}

// Singleton instance
let orchestratorInstance: Orchestrator | null = null;

export function getOrchestrator(): Orchestrator {
    if (!orchestratorInstance) {
        orchestratorInstance = new Orchestrator();
    }
    return orchestratorInstance;
}
