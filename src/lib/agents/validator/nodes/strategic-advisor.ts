// Strategic Advisor Node - Stage 4 of Validation Pipeline

import { callLLMServer as callLLM } from "../../../llm/server-client";
import { StrategicAdvice, MarketAnalysis, CompetitorAnalysis, RiskAssessment } from "../types";
import { STRATEGIC_ADVISOR_SYSTEM, STRATEGIC_ADVISOR_USER } from "../prompts/strategic-advisor";

export interface StrategicAdvisorInput {
    idea: {
        title: string;
        description: string;
    };
    marketAnalysis: MarketAnalysis;
    competitorAnalysis: CompetitorAnalysis;
    riskAssessment: RiskAssessment;
}

export interface StrategicAdvisorOutput {
    advice: StrategicAdvice;
    processingTime: number;
}

/**
 * Strategic Advisor Node
 * 
 * Synthesizes all analysis and provides:
 * - GO/NO_GO/CONDITIONAL recommendation
 * - Refined idea based on insights
 * - Overall viability scores
 * - Actionable next steps
 * - Critical success factors
 */
export async function strategicAdvisorNode(
    input: StrategicAdvisorInput,
    onProgress?: (message: string) => void
): Promise<StrategicAdvisorOutput> {
    const startTime = Date.now();

    onProgress?.("🎯 Synthesizing all analysis data...");
    onProgress?.("🤖 Generating strategic recommendation...");

    // Call LLM for final synthesis
    const response = await callLLM({
        systemPrompt: STRATEGIC_ADVISOR_SYSTEM,
        userPrompt: STRATEGIC_ADVISOR_USER(
            input.idea,
            {
                industry: input.marketAnalysis.industry,
                marketSize: input.marketAnalysis.marketSize,
                timing: input.marketAnalysis.timing,
                opportunities: input.marketAnalysis.opportunities,
                threats: input.marketAnalysis.threats,
            },
            {
                directCompetitors: input.competitorAnalysis.directCompetitors,
                marketGaps: input.competitorAnalysis.marketGaps,
                differentiationOpportunities: input.competitorAnalysis.differentiationOpportunities,
                competitiveAdvantageScore: input.competitorAnalysis.competitiveAdvantageScore,
            },
            {
                overallRiskScore: input.riskAssessment.overallRiskScore,
                overallRiskLevel: input.riskAssessment.overallRiskLevel,
                topRisks: input.riskAssessment.topRisks,
                criticalBlockers: input.riskAssessment.criticalBlockers,
            }
        ),
        temperature: 0.4, // Slightly higher for more creative advice
        maxTokens: 3500,
    });

    // Parse JSON response
    let advice: StrategicAdvice;
    try {
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        advice = {
            recommendation: parsed.recommendation || "CONDITIONAL",
            confidenceScore: parsed.confidenceScore || 50,
            reasoning: parsed.reasoning || "Unable to provide reasoning",

            refinedIdea: {
                title: parsed.refinedIdea?.title || input.idea.title,
                description: parsed.refinedIdea?.description || input.idea.description,
                targetAudience: parsed.refinedIdea?.targetAudience || "General audience",
                uniqueValueProposition: parsed.refinedIdea?.uniqueValueProposition || "",
                problemSolved: parsed.refinedIdea?.problemSolved || "",
                suggestedPivots: parsed.refinedIdea?.suggestedPivots || [],
            },

            scores: {
                marketPotential: parsed.scores?.marketPotential || 50,
                feasibility: parsed.scores?.feasibility || 50,
                uniqueness: parsed.scores?.uniqueness || 50,
                scalability: parsed.scores?.scalability || 50,
                timing: parsed.scores?.timing || 50,
                overall: parsed.scores?.overall || 50,
            },

            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            keyInsights: parsed.keyInsights || [],

            nextSteps: (parsed.nextSteps || []).map((step: Record<string, unknown>, idx: number) => ({
                priority: (step.priority as number) || idx + 1,
                action: (step.action as string) || "",
                timeframe: (step.timeframe as string) || "TBD",
                resources: step.resources as string | undefined,
                successCriteria: step.successCriteria as string | undefined,
            })),

            criticalSuccess: parsed.criticalSuccess || [],
            conditions: parsed.conditions,
            executiveSummary: parsed.executiveSummary || "Analysis complete.",
        };
    } catch (parseError) {
        console.error("Failed to parse strategic advice:", parseError);
        console.error("Raw response:", response);

        // Return conservative fallback
        advice = {
            recommendation: "CONDITIONAL",
            confidenceScore: 30,
            reasoning: "Analysis completed but unable to parse full results. Manual review recommended.",
            refinedIdea: {
                title: input.idea.title,
                description: input.idea.description,
                targetAudience: "To be determined",
                uniqueValueProposition: "To be refined",
                problemSolved: "To be clarified",
            },
            scores: {
                marketPotential: 50,
                feasibility: 50,
                uniqueness: 50,
                scalability: 50,
                timing: 50,
                overall: 50,
            },
            strengths: [],
            weaknesses: ["Unable to fully analyze - please review manually"],
            keyInsights: [],
            nextSteps: [
                {
                    priority: 1,
                    action: "Review analysis results manually",
                    timeframe: "Immediately",
                },
            ],
            criticalSuccess: [],
            executiveSummary: "Analysis partially completed. Recommend manual review of results.",
        };
    }

    const processingTime = Date.now() - startTime;

    // Determine final message based on recommendation
    const emoji = advice.recommendation === "GO" ? "🚀" :
        advice.recommendation === "NO_GO" ? "⛔" : "⚠️";
    onProgress?.(`${emoji} Recommendation: ${advice.recommendation} (${(processingTime / 1000).toFixed(1)}s)`);

    return {
        advice,
        processingTime,
    };
}
