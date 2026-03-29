// Planner Agent Types - Task Management System

// ============================================
// Task Types
// ============================================

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    phase: string;
    assignedAgent?: "validator" | "planner" | "tech" | "business" | "developer";
    subtasks?: Task[];
    createdAt: Date;
    completedAt?: Date;
}

export interface Phase {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    order: number;
}

// ============================================
// Implementation Plan Types
// ============================================

export type FileAction = "NEW" | "MODIFY" | "DELETE";

export interface FileChange {
    action: FileAction;
    path: string;
    description: string;
}

export interface Component {
    name: string;
    description: string;
    files: FileChange[];
}

export interface ImplementationPlan {
    goal: string;
    summary: string;
    components: Component[];
    verificationPlan: {
        automated: string[];
        manual: string[];
    };
}

// ============================================
// Walkthrough Types
// ============================================

export interface Walkthrough {
    title: string;
    summary: string;
    keyDecisions: string[];
    filesChanged: { path: string; description: string }[];
    howToRun: string[];
    nextSteps: string[];
}

// ============================================
// Planner Output
// ============================================

export interface PlannerOutput {
    projectName: string;
    phases: Phase[];
    implementationPlan: ImplementationPlan;

    // Markdown representations
    taskMarkdown: string;
    planMarkdown: string;

    // Metadata
    totalTasks: number;
    estimatedTime: string;
}

// ============================================
// Task State (for Zustand store)
// ============================================

export interface TaskState {
    projectName: string;
    phases: Phase[];
    implementationPlan: ImplementationPlan | null;
    walkthrough: Walkthrough | null;

    // Actions
    setProject: (name: string, phases: Phase[], plan: ImplementationPlan) => void;
    updateTaskStatus: (taskId: string, status: TaskStatus) => void;
    getTaskById: (taskId: string) => Task | undefined;
    getTasksByAgent: (agent: string) => Task[];
    getCompletionPercentage: () => number;
    generateTaskMarkdown: () => string;
    setWalkthrough: (walkthrough: Walkthrough) => void;
    reset: () => void;
}
