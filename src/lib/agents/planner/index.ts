// Planner Agent - Main Orchestrator
// Runs the 2-stage planning pipeline

import { Phase, ImplementationPlan, PlannerOutput } from "./types";
import { taskDecomposerNode } from "./nodes/task-decomposer";
import { implementationPlannerNode } from "./nodes/implementation-planner";
import { generatePlanMarkdown } from "./store";

export interface PlannerInput {
    title: string;
    description: string;
    validationResult?: {
        recommendation: string;
        refinedIdea?: {
            targetAudience: string;
        };
    };
    techSpec?: {
        techStack?: { frontend: string[]; backend: string[] };
        mvpFeatures?: { name: string; description: string }[];
    };
}

export interface PlannerProgress {
    stage: "decomposing" | "planning" | "complete" | "error";
    progress: number;
    message: string;
}

export type ProgressCallback = (progress: PlannerProgress) => void;

/**
 * Planner Agent - Project Planning System
 * 
 * Runs a 2-stage pipeline:
 * 1. Task Decomposer - Break idea into phases and tasks
 * 2. Implementation Planner - Create technical roadmap
 */
export async function planProject(
    input: PlannerInput,
    onProgress?: ProgressCallback
): Promise<PlannerOutput> {
    const startTime = Date.now();

    const emit = (stage: PlannerProgress["stage"], progress: number, message: string) => {
        onProgress?.({ stage, progress, message });
    };

    try {
        // ========================================
        // Stage 1: Task Decomposition
        // ========================================
        emit("decomposing", 0, "Breaking down project into tasks...");

        const decomposerResult = await taskDecomposerNode(
            {
                idea: { title: input.title, description: input.description },
                validationResult: input.validationResult,
            },
            (msg) => emit("decomposing", 30, msg)
        );

        emit("decomposing", 50, "Tasks structured");

        // ========================================
        // Stage 2: Implementation Planning
        // ========================================
        emit("planning", 50, "Creating implementation plan...");

        const plannerResult = await implementationPlannerNode(
            {
                idea: { title: input.title, description: input.description },
                phases: decomposerResult.phases,
                techSpec: input.techSpec,
            },
            (msg) => emit("planning", 80, msg)
        );

        emit("complete", 100, "Planning complete!");

        // ========================================
        // Generate Markdown Documents
        // ========================================
        const taskMarkdown = generateTaskMarkdownFromPhases(
            decomposerResult.projectName,
            decomposerResult.phases
        );

        const planMarkdown = generatePlanMarkdown(
            decomposerResult.projectName,
            plannerResult.plan
        );

        return {
            projectName: decomposerResult.projectName,
            phases: decomposerResult.phases,
            implementationPlan: plannerResult.plan,
            taskMarkdown,
            planMarkdown,
            totalTasks: decomposerResult.totalTasks,
            estimatedTime: decomposerResult.estimatedTime,
        };

    } catch (error) {
        emit("error", 0, `Planning failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        throw error;
    }
}

/**
 * Generate task.md markdown from phases
 */
function generateTaskMarkdownFromPhases(projectName: string, phases: Phase[]): string {
    let md = `# ${projectName}\n\n`;

    for (const phase of phases.sort((a, b) => a.order - b.order)) {
        md += `## ${phase.name}\n`;
        if (phase.description) {
            md += `${phase.description}\n\n`;
        }

        for (const task of phase.tasks) {
            const checkbox = task.status === "completed" ? "[x]"
                : task.status === "in_progress" ? "[/]"
                    : "[ ]";
            const agent = task.assignedAgent ? ` *(${task.assignedAgent})*` : "";
            md += `- ${checkbox} ${task.title}${agent}\n`;
        }
        md += "\n";
    }

    return md;
}

// Re-export types and store
export * from "./types";
export { useTaskStore, generatePlanMarkdown, generateWalkthroughMarkdown } from "./store";
