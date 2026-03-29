import { AzureOpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

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

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, maxTokens = 4096, temperature = 0.7 } = body as {
            messages: ChatMessage[];
            maxTokens?: number;
            temperature?: number;
        };

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        const response = await azureClient.chat.completions.create({
            messages,
            max_tokens: maxTokens,
            temperature,
            model: deployment,
        });

        const content = response.choices[0]?.message?.content || "";

        return NextResponse.json({ content });
    } catch (error) {
        console.error("LLM API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "LLM request failed" },
            { status: 500 }
        );
    }
}
