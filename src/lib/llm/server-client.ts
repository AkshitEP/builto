// Server-side LLM client for API routes
// Uses Groq Cloud (OpenAI-compatible API)

import OpenAI from "openai";

// Lazy-initialized Groq client (avoids build-time errors)
let groqClient: OpenAI | null = null;

function getClient() {
    if (!groqClient) {
        groqClient = new OpenAI({
            apiKey: process.env.GROQ_API_KEY || "",
            baseURL: "https://api.groq.com/openai/v1",
        });
    }
    return groqClient;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

/**
 * Server-side chat function using Groq Cloud
 */
export async function serverChat(
    messages: ChatMessage[],
    options?: {
        maxTokens?: number;
        temperature?: number;
    }
): Promise<string> {
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const response = await getClient().chat.completions.create({
        messages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        model,
    });

    const content = response.choices[0]?.message?.content || "";
    return content;
}

/**
 * Simple helper for calling LLM with system and user prompts (server-side)
 */
export async function callLLMServer(options: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
}): Promise<string> {
    const messages: ChatMessage[] = [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
    ];

    return serverChat(messages, {
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 4096,
    });
}
