// Validator Agent - Main Orchestrator
// Runs the 4-stage validation pipeline

import {
    ValidatorState,
    ValidationResult,
    ValidatorStage,
    SearchQuery
} from "./types";
import { marketAnalystNode } from "./nodes/market-analyst";
import { competitorAnalystNode } from "./nodes/competitor-analyst";
import { riskAssessorNode } from "./nodes/risk-assessor";
import { strategicAdvisorNode } from "./nodes/strategic-advisor";

export interface ValidatorInput {
    title: string;
    description: string;
}

export interface ValidatorProgress {
    stage: ValidatorStage;
    stageProgress: number;
    overallProgress: number;
    message: string;
    timestamp: Date;
}

export type ProgressCallback = (progress: ValidatorProgress) => void;

/**
 * Validator Agent - Comprehensive Startup Idea Validation
 * 
 * Runs a 4-stage pipeline:
 * 1. Market Analysis - Market size, trends, timing
 * 2. Competitor Analysis - Competitive landscape, gaps
 * 3. Risk Assessment - 5-dimension risk evaluation
 * 4. Strategic Advice - GO/NO_GO recommendation
 */
export async function validateStartupIdea(
    input: ValidatorInput,
    onProgress?: ProgressCallback
): Promise<ValidationResult> {
    const startTime = Date.now();

    // Initialize state
    const state: ValidatorState = {
        idea: { title: input.title, description: input.description },
        currentStage: "initializing",
        stageProgress: 0,
        overallProgress: 0,
        startTime: new Date(),
        stageTimings: {} as Record<ValidatorStage, number>,
        allSearchQueries: [],
        errors: [],
    };

    const emit = (stage: ValidatorStage, stageProgress: number, message: string) => {
        // Calculate overall progress
        const stageWeights: Record<ValidatorStage, number> = {
            initializing: 0,
            market_analysis: 25,
            competitor_analysis: 50,
            risk_assessment: 75,
            strategic_advice: 90,
            complete: 100,
            error: 0,
        };

        const overallProgress = stageWeights[stage] + (stageProgress * 0.25);

        state.currentStage = stage;
        state.stageProgress = stageProgress;
        state.overallProgress = Math.min(overallProgress, 100);

        onProgress?.({
            stage,
            stageProgress,
            overallProgress: state.overallProgress,
            message,
            timestamp: new Date(),
        });
    };

    try {
        // ========================================
        // Stage 1: Market Analysis
        // ========================================
        emit("market_analysis", 0, "Starting market analysis...");

        const marketResult = await marketAnalystNode(
            { idea: state.idea },
            (msg) => emit("market_analysis", 50, msg)
        );

        state.marketAnalysis = marketResult.analysis;
        state.allSearchQueries.push(...marketResult.searchQueries);
        state.stageTimings.market_analysis = marketResult.processingTime;

        emit("market_analysis", 100, "Market analysis complete");

        // ========================================
        // Stage 2: Competitor Analysis
        // ========================================
        emit("competitor_analysis", 0, "Starting competitor analysis...");

        const competitorResult = await competitorAnalystNode(
            {
                idea: state.idea,
                marketAnalysis: state.marketAnalysis,
            },
            (msg) => emit("competitor_analysis", 50, msg)
        );

        state.competitorAnalysis = competitorResult.analysis;
        state.allSearchQueries.push(...competitorResult.searchQueries);
        state.stageTimings.competitor_analysis = competitorResult.processingTime;

        emit("competitor_analysis", 100, "Competitor analysis complete");

        // ========================================
        // Stage 3: Risk Assessment
        // ========================================
        emit("risk_assessment", 0, "Starting risk assessment...");

        const riskResult = await riskAssessorNode(
            {
                idea: state.idea,
                marketAnalysis: state.marketAnalysis,
                competitorAnalysis: state.competitorAnalysis,
            },
            (msg) => emit("risk_assessment", 50, msg)
        );

        state.riskAssessment = riskResult.assessment;
        state.allSearchQueries.push(...riskResult.searchQueries);
        state.stageTimings.risk_assessment = riskResult.processingTime;

        emit("risk_assessment", 100, "Risk assessment complete");

        // ========================================
        // Stage 4: Strategic Advice
        // ========================================
        emit("strategic_advice", 0, "Generating strategic recommendation...");

        const advisorResult = await strategicAdvisorNode(
            {
                idea: state.idea,
                marketAnalysis: state.marketAnalysis,
                competitorAnalysis: state.competitorAnalysis,
                riskAssessment: state.riskAssessment,
            },
            (msg) => emit("strategic_advice", 50, msg)
        );

        state.strategicAdvice = advisorResult.advice;
        state.stageTimings.strategic_advice = advisorResult.processingTime;

        emit("complete", 100, "Validation complete!");

        // ========================================
        // Build Final Result
        // ========================================
        const processingTime = Date.now() - startTime;

        const result: ValidationResult = {
            success: true,

            recommendation: state.strategicAdvice.recommendation,
            overallScore: state.strategicAdvice.scores.overall,
            validated: state.strategicAdvice.recommendation !== "NO_GO",

            marketAnalysis: state.marketAnalysis,
            competitorAnalysis: state.competitorAnalysis,
            riskAssessment: state.riskAssessment,
            strategicAdvice: state.strategicAdvice,

            refinedIdea: state.strategicAdvice.refinedIdea,
            scores: state.strategicAdvice.scores,

            strengths: state.strategicAdvice.strengths,
            weaknesses: state.strategicAdvice.weaknesses,
            recommendations: state.strategicAdvice.keyInsights,
            nextSteps: state.strategicAdvice.nextSteps,

            sources: state.allSearchQueries,

            processingTime,
            timestamp: new Date(),
        };

        return result;

    } catch (error) {
        emit("error", 0, `Error: ${error instanceof Error ? error.message : "Unknown error"}`);

        console.error("Validation failed:", error);

        // Return partial result with error
        throw new Error(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Get a human-readable stage name
 */
export function getStageName(stage: ValidatorStage): string {
    const names: Record<ValidatorStage, string> = {
        initializing: "Initializing",
        market_analysis: "Market Analysis",
        competitor_analysis: "Competitor Analysis",
        risk_assessment: "Risk Assessment",
        strategic_advice: "Strategic Advice",
        complete: "Complete",
        error: "Error",
    };
    return names[stage];
}

/**
 * Get stage icon
 */
export function getStageIcon(stage: ValidatorStage): string {
    const icons: Record<ValidatorStage, string> = {
        initializing: "⏳",
        market_analysis: "📊",
        competitor_analysis: "🔍",
        risk_assessment: "⚠️",
        strategic_advice: "🎯",
        complete: "✅",
        error: "❌",
    };
    return icons[stage];
}

// Re-export types
export * from "./types";
