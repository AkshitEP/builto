import { BaseAgent, AgentContext, AgentOutput } from "./base-agent";
import type { ValidationResult, ValidatorStage } from "./validator/types";

// Helper functions for UI
function getStageName(stage: ValidatorStage): string {
    const names: Record<ValidatorStage, string> = {
        initializing: "Initializing",
        market_analysis: "Market Analysis",
        competitor_analysis: "Competitor Analysis",
        risk_assessment: "Risk Assessment",
        strategic_advice: "Strategic Advice",
        complete: "Complete",
        error: "Error",
    };
    return names[stage] || stage;
}

function getStageIcon(stage: ValidatorStage): string {
    const icons: Record<ValidatorStage, string> = {
        initializing: "⏳",
        market_analysis: "📊",
        competitor_analysis: "🔍",
        risk_assessment: "⚠️",
        strategic_advice: "🎯",
        complete: "✅",
        error: "❌",
    };
    return icons[stage] || "🔄";
}

export class ValidatorAgent extends BaseAgent {
    name = "Validator";
    role = "Comprehensive Startup Idea Validator";

    systemPrompt = `You are an expert startup validation system that performs comprehensive multi-stage analysis.`;

    async execute(context: AgentContext): Promise<AgentOutput> {
        this.updateStatus({
            stage: "thinking",
            message: `Starting comprehensive validation for: ${context.ideaTitle}`,
        });

        try {
            // Update progress through stages
            const stages: ValidatorStage[] = [
                "market_analysis",
                "competitor_analysis",
                "risk_assessment",
                "strategic_advice"
            ];

            let progress = 0;
            const progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += 10;
                    const stageIndex = Math.min(Math.floor(progress / 25), stages.length - 1);
                    const currentStage = stages[stageIndex];
                    this.updateStatus({
                        stage: "executing",
                        message: `${getStageIcon(currentStage)} ${getStageName(currentStage)}...`,
                        progress,
                    });
                }
            }, 3000);

            // Call the server-side validation API
            const response = await fetch("/api/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: context.ideaTitle,
                    description: context.ideaDescription,
                }),
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Validation failed");
            }

            const result: ValidationResult = await response.json();

            // Convert to legacy format for compatibility
            const legacyData = this.convertToLegacyFormat(result);

            this.updateStatus({
                stage: "completed",
                message: `✅ Validation complete! Recommendation: ${result.recommendation} (Score: ${result.overallScore}/100)`,
                progress: 100,
            });

            return {
                success: true,
                data: {
                    // Full new format
                    ...result,
                    // Legacy fields for UI compatibility
                    ...legacyData,
                },
                summary: this.buildSummary(result),
                requiresApproval: true,
                approvalPrompt: this.buildApprovalPrompt(result, context.ideaTitle),
            };
        } catch (error) {
            this.updateStatus({
                stage: "error",
                message: `Validation failed: ${error}`,
            });

            return {
                success: false,
                data: null,
                summary: `Validation error: ${error}`,
            };
        }
    }

    /**
     * Convert new validation result to legacy format for UI compatibility
     */
    private convertToLegacyFormat(result: ValidationResult) {
        return {
            overallScore: result.overallScore / 10, // Convert 100 scale to 10 scale
            validated: result.validated,
            refinedIdea: {
                title: result.refinedIdea.title,
                description: result.refinedIdea.description,
                targetAudience: result.refinedIdea.targetAudience,
                uniqueValue: result.refinedIdea.uniqueValueProposition,
                revenueModel: "See business analysis for revenue model",
            },
            scores: {
                problemClarity: Math.round(result.scores.marketPotential / 10),
                marketSize: Math.round(result.scores.marketPotential / 10),
                competition: Math.round(result.scores.uniqueness / 10),
                feasibility: Math.round(result.scores.feasibility / 10),
                revenueViability: Math.round(result.scores.scalability / 10),
            },
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            recommendations: result.recommendations,
            priorityScore: result.overallScore,
        };
    }

    /**
     * Build summary message
     */
    private buildSummary(result: ValidationResult): string {
        const emoji = result.recommendation === "GO" ? "🚀"
            : result.recommendation === "NO_GO" ? "⛔"
                : "⚠️";

        return `${emoji} **${result.recommendation}** | Score: ${result.overallScore}/100 | ` +
            `${result.competitorAnalysis.directCompetitors.length} competitors found | ` +
            `Risk: ${result.riskAssessment.overallRiskLevel} | ` +
            `Processing: ${(result.processingTime / 1000).toFixed(1)}s`;
    }

    /**
     * Build approval prompt
     */
    private buildApprovalPrompt(result: ValidationResult, originalTitle: string): string {
        const recommendation = result.recommendation;
        const score = result.overallScore;

        if (recommendation === "GO") {
            return `🚀 **Great news!** The validator recommends **GO** for "${originalTitle}" with a score of ${score}/100.\n\n` +
                `**Key Strengths:**\n${result.strengths.slice(0, 3).map(s => `• ${s}`).join("\n")}\n\n` +
                `Do you approve moving forward with the refined idea to the next agents?`;
        } else if (recommendation === "NO_GO") {
            return `⛔ The validator recommends **NO_GO** for "${originalTitle}" (Score: ${score}/100).\n\n` +
                `**Key Concerns:**\n${result.weaknesses.slice(0, 3).map(w => `• ${w}`).join("\n")}\n\n` +
                `**Suggested Pivots:**\n${result.refinedIdea.suggestedPivots?.slice(0, 2).map(p => `• ${p}`).join("\n") || "Consider refining the idea"}\n\n` +
                `Would you like to proceed anyway or refine the idea?`;
        } else {
            return `⚠️ **Conditional Go** for "${originalTitle}" (Score: ${score}/100).\n\n` +
                `**Conditions to Address:**\n${result.strategicAdvice.conditions?.slice(0, 3).map(c => `• ${c}`).join("\n") || "Review the detailed analysis"}\n\n` +
                `Do you want to proceed with the refined version?`;
        }
    }
}
