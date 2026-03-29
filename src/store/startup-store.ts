import { create } from "zustand";
import { StartupIdea, StartupStatus } from "@/lib/orchestrator/priority-queue";
import { AgentOutput, AgentStatus } from "@/lib/agents";

export interface StartupState {
    id: string;
    idea: StartupIdea;
    status: StartupStatus;
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

export interface ActivityLogEntry {
    id: string;
    timestamp: Date;
    type: "info" | "success" | "warning" | "error";
    message: string;
    ideaId?: string;
    agent?: string;
}

interface StartupStore {
    // State
    startups: Map<string, StartupState>;
    pendingApprovals: ApprovalRequest[];
    activityLog: ActivityLogEntry[];
    isProcessing: boolean;

    // Actions
    addStartup: (idea: StartupIdea) => void;
    updateStartup: (id: string, updates: Partial<StartupState>) => void;
    removeStartup: (id: string) => void;

    addApproval: (request: ApprovalRequest) => void;
    removeApproval: (ideaId: string) => void;

    addActivity: (entry: Omit<ActivityLogEntry, "id" | "timestamp">) => void;
    clearActivity: () => void;

    setProcessing: (processing: boolean) => void;

    // Selectors
    getStartup: (id: string) => StartupState | undefined;
    getStartupsList: () => StartupState[];
    getActiveStartups: () => StartupState[];
    getCompletedStartups: () => StartupState[];
}

export const useStartupStore = create<StartupStore>((set, get) => ({
    startups: new Map(),
    pendingApprovals: [],
    activityLog: [],
    isProcessing: false,

    addStartup: (idea) => {
        const state: StartupState = {
            id: idea.id,
            idea,
            status: idea.status,
            outputs: {},
            currentAgent: null,
            agentStatus: null,
            error: null,
        };

        set((s) => {
            const newStartups = new Map(s.startups);
            newStartups.set(idea.id, state);
            return { startups: newStartups };
        });

        get().addActivity({
            type: "info",
            message: `New idea added: "${idea.title}"`,
            ideaId: idea.id,
        });
    },

    updateStartup: (id, updates) => {
        set((s) => {
            const newStartups = new Map(s.startups);
            const existing = newStartups.get(id);
            if (existing) {
                newStartups.set(id, { ...existing, ...updates });
            }
            return { startups: newStartups };
        });
    },

    removeStartup: (id) => {
        set((s) => {
            const newStartups = new Map(s.startups);
            newStartups.delete(id);
            return { startups: newStartups };
        });
    },

    addApproval: (request) => {
        set((s) => ({
            pendingApprovals: [...s.pendingApprovals, request],
        }));

        get().addActivity({
            type: "warning",
            message: `Approval needed: ${request.prompt}`,
            ideaId: request.ideaId,
            agent: request.agent,
        });
    },

    removeApproval: (ideaId) => {
        set((s) => ({
            pendingApprovals: s.pendingApprovals.filter((a) => a.ideaId !== ideaId),
        }));
    },

    addActivity: (entry) => {
        const fullEntry: ActivityLogEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        };

        set((s) => ({
            activityLog: [fullEntry, ...s.activityLog].slice(0, 100), // Keep last 100
        }));
    },

    clearActivity: () => {
        set({ activityLog: [] });
    },

    setProcessing: (processing) => {
        set({ isProcessing: processing });
    },

    getStartup: (id) => get().startups.get(id),

    getStartupsList: () => Array.from(get().startups.values()),

    getActiveStartups: () =>
        Array.from(get().startups.values()).filter(
            (s) => !["completed", "rejected", "paused"].includes(s.status)
        ),

    getCompletedStartups: () =>
        Array.from(get().startups.values()).filter((s) => s.status === "completed"),
}));
