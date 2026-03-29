// API Route for Validator Agent - Runs on server with web search
import { NextRequest, NextResponse } from "next/server";
import {
    validateStartupIdea,
    ValidationResult,
} from "@/lib/agents/validator/index";

export const maxDuration = 60; // Allow up to 60 seconds for validation

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description } = body;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Title and description are required" },
                { status: 400 }
            );
        }

        // Run the validation pipeline
        const result: ValidationResult = await validateStartupIdea({
            title,
            description,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Validation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Validation failed" },
            { status: 500 }
        );
    }
}
