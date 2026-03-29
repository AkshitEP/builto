// Implementation Planner Node - Create technical roadmap

import { callLLMServer as callLLM } from "../../../llm/server-client";
import { ImplementationPlan, Phase } from "../types";
import { IMPLEMENTATION_PLANNER_SYSTEM, IMPLEMENTATION_PLANNER_USER } from "../prompts/implementation-planner";

export interface ImplementationPlannerInput {
    idea: {
        title: string;
        description: string;
    };
    phases: Phase[];
    techSpec?: {
        techStack?: { frontend: string[]; backend: string[] };
        mvpFeatures?: { name: string; description: string }[];
    };
}

export interface ImplementationPlannerOutput {
    plan: ImplementationPlan;
    processingTime: number;
}

/**
 * Implementation Planner Node
 * 
 * Creates a detailed implementation plan with:
 * - Components to build
 * - Files to create/modify/delete
 * - Verification steps
 */
export async function implementationPlannerNode(
    input: ImplementationPlannerInput,
    onProgress?: (message: string) => void
): Promise<ImplementationPlannerOutput> {
    const startTime = Date.now();

    onProgress?.("📝 Creating implementation roadmap...");

    // Prepare phases for prompt
    const phaseSummary = input.phases.map(p => ({
        name: p.name,
        tasks: p.tasks.map(t => ({ title: t.title })),
    }));

    // Call LLM to create plan
    const response = await callLLM({
        systemPrompt: IMPLEMENTATION_PLANNER_SYSTEM,
        userPrompt: IMPLEMENTATION_PLANNER_USER(input.idea, phaseSummary, input.techSpec),
        temperature: 0.3,
        maxTokens: 2500,
    });

    onProgress?.("🔧 Structuring implementation plan...");

    // Parse JSON response
    let plan: ImplementationPlan;

    try {
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        plan = {
            goal: parsed.goal || `Build MVP for ${input.idea.title}`,
            summary: parsed.summary || "Implementation plan generated.",
            components: (parsed.components || []).map((c: Record<string, unknown>) => ({
                name: (c.name as string) || "Component",
                description: (c.description as string) || "",
                files: ((c.files as Record<string, unknown>[]) || []).map((f: Record<string, unknown>) => ({
                    action: (f.action as "NEW" | "MODIFY" | "DELETE") || "NEW",
                    path: (f.path as string) || "src/unknown.ts",
                    description: (f.description as string) || "",
                })),
            })),
            verificationPlan: {
                automated: (parsed.verificationPlan?.automated as string[]) || ["Run npm run build"],
                manual: (parsed.verificationPlan?.manual as string[]) || ["Test in browser"],
            },
        };
    } catch (parseError) {
        console.error("Failed to parse implementation plan:", parseError);

        // Create minimal fallback
        plan = {
            goal: `Build MVP for ${input.idea.title}`,
            summary: "Implementation plan could not be fully generated. Please review manually.",
            components: [],
            verificationPlan: {
                automated: ["Run npm run build"],
                manual: ["Test in browser"],
            },
        };
    }

    const processingTime = Date.now() - startTime;
    const totalFiles = plan.components.reduce((sum, c) => sum + c.files.length, 0);
    onProgress?.(`✅ Plan ready: ${plan.components.length} components, ${totalFiles} files`);

    return {
        plan,
        processingTime,
    };
}
