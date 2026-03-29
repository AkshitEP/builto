import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// Groq Cloud Configuration (server-side only)
const groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1",
});

const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

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

        const response = await groqClient.chat.completions.create({
            messages,
            max_tokens: maxTokens,
            temperature,
            model,
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
