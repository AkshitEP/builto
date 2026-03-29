// Task Decomposer Node - Break down startup idea into phases and tasks

import { callLLMServer as callLLM } from "../../../llm/server-client";
import { Phase, Task } from "../types";
import { TASK_DECOMPOSER_SYSTEM, TASK_DECOMPOSER_USER } from "../prompts/task-decomposer";

export interface TaskDecomposerInput {
    idea: {
        title: string;
        description: string;
    };
    validationResult?: {
        recommendation: string;
        refinedIdea?: {
            targetAudience: string;
        };
    };
}

export interface TaskDecomposerOutput {
    projectName: string;
    phases: Phase[];
    estimatedTime: string;
    totalTasks: number;
    processingTime: number;
}

/**
 * Task Decomposer Node
 * 
 * Takes a startup idea and breaks it down into:
 * - Phases (Foundation, Core Features, Polish, Launch)
 * - Tasks (15-25 specific, actionable items)
 * - Agent assignments
 */
export async function taskDecomposerNode(
    input: TaskDecomposerInput,
    onProgress?: (message: string) => void
): Promise<TaskDecomposerOutput> {
    const startTime = Date.now();

    onProgress?.("📋 Analyzing project requirements...");

    // Call LLM to decompose tasks
    const response = await callLLM({
        systemPrompt: TASK_DECOMPOSER_SYSTEM,
        userPrompt: TASK_DECOMPOSER_USER(input.idea, input.validationResult),
        temperature: 0.4,
        maxTokens: 3000,
    });

    onProgress?.("🔧 Structuring tasks and phases...");

    // Parse JSON response
    let result: { projectName: string; phases: Phase[]; estimatedTime: string };

    try {
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        // Ensure all tasks have proper structure
        const phases: Phase[] = (parsed.phases || []).map((p: Record<string, unknown>, pIdx: number) => ({
            id: (p.id as string) || `phase-${pIdx + 1}`,
            name: (p.name as string) || `Phase ${pIdx + 1}`,
            description: (p.description as string) || "",
            order: (p.order as number) || pIdx + 1,
            tasks: ((p.tasks as Record<string, unknown>[]) || []).map((t: Record<string, unknown>, tIdx: number) => ({
                id: (t.id as string) || `task-${pIdx + 1}-${tIdx + 1}`,
                title: (t.title as string) || "Untitled task",
                description: t.description as string | undefined,
                status: "pending" as const,
                phase: (p.name as string) || `Phase ${pIdx + 1}`,
                assignedAgent: t.assignedAgent as Task["assignedAgent"],
                createdAt: new Date(),
            })),
        }));

        result = {
            projectName: parsed.projectName || input.idea.title.toLowerCase().replace(/\s+/g, "-"),
            phases,
            estimatedTime: parsed.estimatedTime || "2-3 weeks",
        };
    } catch (parseError) {
        console.error("Failed to parse task decomposition:", parseError);

        // Create minimal fallback
        result = {
            projectName: input.idea.title.toLowerCase().replace(/\s+/g, "-"),
            phases: [
                {
                    id: "phase-1",
                    name: "Foundation",
                    description: "Set up project structure",
                    order: 1,
                    tasks: [
                        {
                            id: "task-1-1",
                            title: "Initialize project",
                            status: "pending",
                            phase: "Foundation",
                            assignedAgent: "developer",
                            createdAt: new Date(),
                        },
                    ],
                },
            ],
            estimatedTime: "Unknown",
        };
    }

    // Count total tasks
    const totalTasks = result.phases.reduce((sum, p) => sum + p.tasks.length, 0);

    const processingTime = Date.now() - startTime;
    onProgress?.(`✅ Created ${totalTasks} tasks across ${result.phases.length} phases`);

    return {
        ...result,
        totalTasks,
        processingTime,
    };
}
