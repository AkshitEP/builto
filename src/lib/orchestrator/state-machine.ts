import { StartupStatus } from "./priority-queue";

export interface StateTransition {
    from: StartupStatus;
    to: StartupStatus;
    trigger: TransitionTrigger;
}

export type TransitionTrigger =
    | "start"
    | "complete"
    | "approve"
    | "reject"
    | "pause"
    | "resume"
    | "skip";

// Define valid state transitions
const validTransitions: StateTransition[] = [
    // Initial queue to validation
    { from: "queued", to: "validating", trigger: "start" },

    // Validation flow
    { from: "validating", to: "validation_review", trigger: "complete" },
    { from: "validation_review", to: "planning", trigger: "approve" },
    { from: "validation_review", to: "rejected", trigger: "reject" },

    // Planning flow
    { from: "planning", to: "planning_review", trigger: "complete" },
    { from: "planning_review", to: "tech_design", trigger: "approve" },
    { from: "planning_review", to: "planning", trigger: "reject" },

    // Tech design flow
    { from: "tech_design", to: "tech_review", trigger: "complete" },
    { from: "tech_review", to: "business_strategy", trigger: "approve" },
    { from: "tech_review", to: "tech_design", trigger: "reject" },

    // Business strategy flow
    { from: "business_strategy", to: "developing", trigger: "complete" },

    // Developer flow (new!)
    { from: "developing", to: "developer_review", trigger: "complete" },
    { from: "developer_review", to: "completed", trigger: "approve" },
    { from: "developer_review", to: "developing", trigger: "reject" },

    // Pause/resume from any active state
    { from: "validating", to: "paused", trigger: "pause" },
    { from: "planning", to: "paused", trigger: "pause" },
    { from: "tech_design", to: "paused", trigger: "pause" },
    { from: "business_strategy", to: "paused", trigger: "pause" },
    { from: "developing", to: "paused", trigger: "pause" },

    // Resume goes back to previous state (handled specially)
    { from: "paused", to: "validating", trigger: "resume" },
    { from: "paused", to: "planning", trigger: "resume" },
    { from: "paused", to: "tech_design", trigger: "resume" },
    { from: "paused", to: "business_strategy", trigger: "resume" },
    { from: "paused", to: "developing", trigger: "resume" },
];

export class StateMachine {
    private currentState: StartupStatus;
    private previousState: StartupStatus | null = null;
    private history: Array<{ state: StartupStatus; timestamp: Date }> = [];

    constructor(initialState: StartupStatus = "queued") {
        this.currentState = initialState;
        this.history.push({ state: initialState, timestamp: new Date() });
    }

    getState(): StartupStatus {
        return this.currentState;
    }

    getPreviousState(): StartupStatus | null {
        return this.previousState;
    }

    getHistory(): Array<{ state: StartupStatus; timestamp: Date }> {
        return [...this.history];
    }

    canTransition(trigger: TransitionTrigger, targetState?: StartupStatus): boolean {
        // Special handling for resume - needs to know target state
        if (trigger === "resume" && this.currentState === "paused") {
            return this.previousState !== null;
        }

        return validTransitions.some(
            (t) =>
                t.from === this.currentState &&
                t.trigger === trigger &&
                (targetState === undefined || t.to === targetState)
        );
    }

    transition(trigger: TransitionTrigger, targetState?: StartupStatus): StartupStatus | null {
        // Special handling for resume
        if (trigger === "resume" && this.currentState === "paused" && this.previousState) {
            const newState = this.previousState;
            this.previousState = this.currentState;
            this.currentState = newState;
            this.history.push({ state: newState, timestamp: new Date() });
            return newState;
        }

        const validTransition = validTransitions.find(
            (t) =>
                t.from === this.currentState &&
                t.trigger === trigger &&
                (targetState === undefined || t.to === targetState)
        );

        if (!validTransition) {
            return null;
        }

        this.previousState = this.currentState;
        this.currentState = validTransition.to;
        this.history.push({ state: validTransition.to, timestamp: new Date() });

        return validTransition.to;
    }

    // Check if current state requires human approval
    requiresApproval(): boolean {
        return [
            "validation_review",
            "planning_review",
            "tech_review",
            "developer_review",
        ].includes(this.currentState);
    }

    // Check if pipeline is complete
    isComplete(): boolean {
        return this.currentState === "completed";
    }

    // Check if idea was rejected
    isRejected(): boolean {
        return this.currentState === "rejected";
    }

    // Check if paused
    isPaused(): boolean {
        return this.currentState === "paused";
    }
}

// Get the next agent to run based on current state
export function getNextAgent(state: StartupStatus): string | null {
    const agentMap: Record<StartupStatus, string | null> = {
        queued: "validator",
        validating: null,
        validation_review: null,
        planning: null,
        planning_review: null,
        tech_design: null,
        tech_review: null,
        business_strategy: null,
        developing: null,
        developer_review: null,
        completed: null,
        paused: null,
        rejected: null,
    };

    return agentMap[state];
}

// Get status display info
export function getStatusInfo(state: StartupStatus): { label: string; color: string } {
    const statusMap: Record<StartupStatus, { label: string; color: string }> = {
        queued: { label: "Queued", color: "gray" },
        validating: { label: "Validating", color: "blue" },
        validation_review: { label: "Awaiting Validation Review", color: "yellow" },
        planning: { label: "Planning", color: "blue" },
        planning_review: { label: "Awaiting Plan Review", color: "yellow" },
        tech_design: { label: "Tech Design", color: "blue" },
        tech_review: { label: "Awaiting Tech Review", color: "yellow" },
        business_strategy: { label: "Business Strategy", color: "blue" },
        developing: { label: "Developing MVP", color: "purple" },
        developer_review: { label: "Review Generated Code", color: "yellow" },
        completed: { label: "Completed", color: "green" },
        paused: { label: "Paused", color: "orange" },
        rejected: { label: "Rejected", color: "red" },
    };

    return statusMap[state];
}
