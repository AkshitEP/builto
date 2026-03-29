// API Route for Planner Agent - Runs on server
import { NextRequest, NextResponse } from "next/server";
import { planProject, PlannerOutput } from "@/lib/agents/planner/index";

export const maxDuration = 60; // Allow up to 60 seconds for planning

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, validationResult, techSpec } = body;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Title and description are required" },
                { status: 400 }
            );
        }

        // Run the planning pipeline
        const result: PlannerOutput = await planProject({
            title,
            description,
            validationResult,
            techSpec,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Planning error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Planning failed" },
            { status: 500 }
        );
    }
}
