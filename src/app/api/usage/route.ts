import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canUsePrompt, usePrompt } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// GET - Check usage status
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const usage = await canUsePrompt(session.user.id);

        return NextResponse.json({
            ...usage,
            plan: session.user.plan,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to get usage" },
            { status: 500 }
        );
    }
}

// POST - Increment usage (called after successful prompt)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const count = body.count || 1;

        // Check if user can use prompt first
        const usage = await canUsePrompt(session.user.id);
        if (!usage.allowed) {
            return NextResponse.json(
                { error: "Usage limit reached. Please upgrade your plan." },
                { status: 403 }
            );
        }

        // Increment usage
        await usePrompt(session.user.id, count);

        // Get updated usage
        const newUsage = await canUsePrompt(session.user.id);

        return NextResponse.json({
            success: true,
            ...newUsage,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update usage" },
            { status: 500 }
        );
    }
}
