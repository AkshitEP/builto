// Server-side LLM client for API routes
// This uses Azure OpenAI directly, not via HTTP

import { AzureOpenAI } from "openai";

// Azure OpenAI Configuration (server-side only)
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
const apiVersion = "2024-12-01-preview";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";

// Create Azure OpenAI client (server-side)
const azureClient = new AzureOpenAI({
    apiVersion,
    endpoint,
    apiKey,
});

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

/**
 * Server-side chat function using Azure OpenAI directly
 */
export async function serverChat(
    messages: ChatMessage[],
    options?: {
        maxTokens?: number;
        temperature?: number;
    }
): Promise<string> {
    const response = await azureClient.chat.completions.create({
        messages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        model: deployment,
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
