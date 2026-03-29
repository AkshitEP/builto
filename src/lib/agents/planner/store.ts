// Task State Store - Zustand store for managing project tasks
// Persists to localStorage for browser persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TaskState, Task, Phase, ImplementationPlan, Walkthrough, TaskStatus } from "./types";

// Helper to find task by ID recursively
function findTaskById(phases: Phase[], taskId: string): Task | undefined {
    for (const phase of phases) {
        for (const task of phase.tasks) {
            if (task.id === taskId) return task;
            if (task.subtasks) {
                const subtask = task.subtasks.find(st => st.id === taskId);
                if (subtask) return subtask;
            }
        }
    }
    return undefined;
}

// Helper to get all tasks
function getAllTasks(phases: Phase[]): Task[] {
    const tasks: Task[] = [];
    for (const phase of phases) {
        for (const task of phase.tasks) {
            tasks.push(task);
            if (task.subtasks) {
                tasks.push(...task.subtasks);
            }
        }
    }
    return tasks;
}

// Generate task.md markdown from current state
function generateTaskMarkdown(projectName: string, phases: Phase[]): string {
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
            md += `- ${checkbox} ${task.title}\n`;

            if (task.subtasks) {
                for (const subtask of task.subtasks) {
                    const subCheckbox = subtask.status === "completed" ? "[x]"
                        : subtask.status === "in_progress" ? "[/]"
                            : "[ ]";
                    md += `  - ${subCheckbox} ${subtask.title}\n`;
                }
            }
        }
        md += "\n";
    }

    return md;
}

// Generate implementation_plan.md markdown
export function generatePlanMarkdown(projectName: string, plan: ImplementationPlan): string {
    let md = `# Implementation Plan: ${projectName}\n\n`;
    md += `## Goal\n${plan.goal}\n\n`;
    md += `${plan.summary}\n\n`;
    md += `---\n\n`;
    md += `## Proposed Changes\n\n`;

    for (const component of plan.components) {
        md += `### ${component.name}\n`;
        md += `${component.description}\n\n`;

        for (const file of component.files) {
            md += `#### [${file.action}] \`${file.path}\`\n`;
            md += `${file.description}\n\n`;
        }
    }

    md += `---\n\n`;
    md += `## Verification Plan\n\n`;
    md += `### Automated Tests\n`;
    for (const step of plan.verificationPlan.automated) {
        md += `- ${step}\n`;
    }
    md += `\n### Manual Verification\n`;
    for (const step of plan.verificationPlan.manual) {
        md += `- ${step}\n`;
    }

    return md;
}

// Generate walkthrough.md markdown
export function generateWalkthroughMarkdown(projectName: string, walkthrough: Walkthrough): string {
    let md = `# Walkthrough: ${projectName}\n\n`;
    md += `## Summary\n${walkthrough.summary}\n\n`;

    md += `## Key Decisions\n`;
    for (const decision of walkthrough.keyDecisions) {
        md += `- ${decision}\n`;
    }
    md += "\n";

    md += `## Files Changed\n`;
    for (const file of walkthrough.filesChanged) {
        md += `- \`${file.path}\` - ${file.description}\n`;
    }
    md += "\n";

    md += `## How to Run\n`;
    walkthrough.howToRun.forEach((step, i) => {
        md += `${i + 1}. ${step}\n`;
    });
    md += "\n";

    if (walkthrough.nextSteps.length > 0) {
        md += `## Next Steps\n`;
        for (const step of walkthrough.nextSteps) {
            md += `- ${step}\n`;
        }
    }

    return md;
}

// Create the Zustand store with persistence
export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            projectName: "",
            phases: [],
            implementationPlan: null,
            walkthrough: null,

            setProject: (name: string, phases: Phase[], plan: ImplementationPlan) => {
                set({
                    projectName: name,
                    phases,
                    implementationPlan: plan,
                    walkthrough: null,
                });
            },

            updateTaskStatus: (taskId: string, status: TaskStatus) => {
                set((state) => {
                    const newPhases = state.phases.map(phase => ({
                        ...phase,
                        tasks: phase.tasks.map(task => {
                            if (task.id === taskId) {
                                return {
                                    ...task,
                                    status,
                                    completedAt: status === "completed" ? new Date() : undefined,
                                };
                            }
                            if (task.subtasks) {
                                return {
                                    ...task,
                                    subtasks: task.subtasks.map(st =>
                                        st.id === taskId
                                            ? { ...st, status, completedAt: status === "completed" ? new Date() : undefined }
                                            : st
                                    ),
                                };
                            }
                            return task;
                        }),
                    }));
                    return { phases: newPhases };
                });
            },

            getTaskById: (taskId: string) => {
                return findTaskById(get().phases, taskId);
            },

            getTasksByAgent: (agent: string) => {
                return getAllTasks(get().phases).filter(t => t.assignedAgent === agent);
            },

            getCompletionPercentage: () => {
                const tasks = getAllTasks(get().phases);
                if (tasks.length === 0) return 0;
                const completed = tasks.filter(t => t.status === "completed").length;
                return Math.round((completed / tasks.length) * 100);
            },

            generateTaskMarkdown: () => {
                const { projectName, phases } = get();
                return generateTaskMarkdown(projectName, phases);
            },

            setWalkthrough: (walkthrough: Walkthrough) => {
                set({ walkthrough });
            },

            reset: () => {
                set({
                    projectName: "",
                    phases: [],
                    implementationPlan: null,
                    walkthrough: null,
                });
            },
        }),
        {
            name: "builto-tasks", // localStorage key
            partialize: (state) => ({
                projectName: state.projectName,
                phases: state.phases,
                implementationPlan: state.implementationPlan,
                walkthrough: state.walkthrough,
            }),
        }
    )
);
