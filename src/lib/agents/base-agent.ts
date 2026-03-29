import { chat, ChatMessage } from "../llm/client";

export interface AgentContext {
    ideaId: string;
    ideaTitle: string;
    ideaDescription: string;
    previousOutputs: Record<string, unknown>;
}

export interface AgentOutput {
    success: boolean;
    data: unknown;
    summary: string;
    requiresApproval?: boolean;
    approvalPrompt?: string;
}

export interface AgentStatus {
    stage: "idle" | "thinking" | "executing" | "awaiting_approval" | "completed" | "error";
    message: string;
    progress?: number;
}

export type AgentStatusCallback = (status: AgentStatus) => void;

// Timeout for LLM calls (90 seconds)
const LLM_TIMEOUT_MS = 90_000;

export abstract class BaseAgent {
    abstract name: string;
    abstract role: string;
    abstract systemPrompt: string;

    protected onStatusChange?: AgentStatusCallback;

    setStatusCallback(callback: AgentStatusCallback) {
        this.onStatusChange = callback;
    }

    protected updateStatus(status: AgentStatus) {
        if (this.onStatusChange) {
            this.onStatusChange(status);
        }
    }

    protected async callLLM(
        userPrompt: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<string> {
        const messages: ChatMessage[] = [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: userPrompt },
        ];

        // Add timeout to prevent hanging forever
        const result = await Promise.race([
            chat(messages, options),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`LLM call timed out after ${LLM_TIMEOUT_MS / 1000}s`)), LLM_TIMEOUT_MS)
            ),
        ]);

        return result;
    }

    protected parseJSON<T>(response: string): T | null {
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            const jsonStr = jsonMatch ? jsonMatch[1].trim() : response.trim();
            return JSON.parse(jsonStr) as T;
        } catch {
            console.error("Failed to parse JSON response:", response.slice(0, 200));
            return null;
        }
    }

    abstract execute(context: AgentContext): Promise<AgentOutput>;
}
