// Risk Assessor Node - Stage 3 of Validation Pipeline

import { callLLMServer as callLLM } from "../../../llm/server-client";
import { RiskAssessment, MarketAnalysis, CompetitorAnalysis, SearchQuery } from "../types";
import { RISK_ASSESSOR_SYSTEM, RISK_ASSESSOR_USER } from "../prompts/risk-assessor";
import { webSearch, buildRiskQueries } from "../tools/web-search";

export interface RiskAssessorInput {
    idea: {
        title: string;
        description: string;
    };
    marketAnalysis: MarketAnalysis;
    competitorAnalysis: CompetitorAnalysis;
}

export interface RiskAssessorOutput {
    assessment: RiskAssessment;
    searchQueries: SearchQuery[];
    processingTime: number;
}

/**
 * Risk Assessor Node
 * 
 * Performs comprehensive risk assessment across 5 dimensions:
 * - Market Risk
 * - Technical Risk
 * - Operational Risk
 * - Regulatory Risk
 * - Financial Risk
 */
export async function riskAssessorNode(
    input: RiskAssessorInput,
    onProgress?: (message: string) => void
): Promise<RiskAssessorOutput> {
    const startTime = Date.now();

    onProgress?.("🔍 Researching potential risks...");

    // Build search queries for risk research
    const queries = buildRiskQueries(input.idea);

    onProgress?.(`⚠️ Searching for risk factors (${queries.length} queries)...`);

    // Execute searches
    const searchResults: SearchQuery[] = [];
    for (const query of queries) {
        try {
            const result = await webSearch(query, { maxResults: 4 });
            searchResults.push(result);
            onProgress?.(`  ✓ Found ${result.results.length} results for "${query.slice(0, 40)}..."`);
        } catch (error) {
            console.error(`Search failed for: ${query}`, error);
        }
    }

    onProgress?.("🤖 Analyzing risks with AI...");

    // Prepare search results for prompt
    const formattedResults = searchResults.map(sq => ({
        query: sq.query,
        results: sq.results.map(r => ({
            title: r.title,
            snippet: r.snippet,
            url: r.url,
        })),
    }));

    // Call LLM for analysis
    const response = await callLLM({
        systemPrompt: RISK_ASSESSOR_SYSTEM,
        userPrompt: RISK_ASSESSOR_USER(
            input.idea,
            {
                industry: input.marketAnalysis.industry,
                timing: input.marketAnalysis.timing,
                threats: input.marketAnalysis.threats,
            },
            {
                directCompetitors: input.competitorAnalysis.directCompetitors,
                competitiveAdvantageScore: input.competitorAnalysis.competitiveAdvantageScore,
            },
            formattedResults
        ),
        temperature: 0.3,
        maxTokens: 3000,
    });

    // Parse JSON response
    let assessment: RiskAssessment;
    try {
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        // Helper to parse risk dimension
        const parseRiskDimension = (dim: Record<string, unknown>, name: string) => ({
            name,
            score: (dim?.score as number) || 50,
            level: (dim?.level as "low" | "medium" | "high" | "critical") || "medium",
            factors: ((dim?.factors as Record<string, unknown>[]) || []).map(f => ({
                factor: (f.factor as string) || "",
                level: (f.level as "low" | "medium" | "high" | "critical") || "medium",
                impact: (f.impact as string) || "",
                likelihood: (f.likelihood as number) || 5,
                mitigation: (f.mitigation as string) || "",
            })),
            overallMitigation: (dim?.overallMitigation as string) || "",
        });

        assessment = {
            overallRiskScore: parsed.overallRiskScore || 50,
            overallRiskLevel: parsed.overallRiskLevel || "medium",
            dimensions: {
                market: parseRiskDimension(parsed.dimensions?.market || {}, "Market Risk"),
                technical: parseRiskDimension(parsed.dimensions?.technical || {}, "Technical Risk"),
                operational: parseRiskDimension(parsed.dimensions?.operational || {}, "Operational Risk"),
                regulatory: parseRiskDimension(parsed.dimensions?.regulatory || {}, "Regulatory Risk"),
                financial: parseRiskDimension(parsed.dimensions?.financial || {}, "Financial Risk"),
            },
            topRisks: (parsed.topRisks || []).map((r: Record<string, unknown>) => ({
                factor: (r.factor as string) || "",
                level: (r.level as "low" | "medium" | "high" | "critical") || "medium",
                impact: (r.impact as string) || "",
                likelihood: (r.likelihood as number) || 5,
                mitigation: (r.mitigation as string) || "",
            })),
            criticalBlockers: parsed.criticalBlockers || [],
            searchQueries: searchResults,
        };
    } catch (parseError) {
        console.error("Failed to parse risk assessment:", parseError);
        console.error("Raw response:", response);

        // Return fallback
        const defaultDimension = {
            name: "Unknown",
            score: 50,
            level: "medium" as const,
            factors: [],
            overallMitigation: "Unable to assess",
        };

        assessment = {
            overallRiskScore: 50,
            overallRiskLevel: "medium",
            dimensions: {
                market: { ...defaultDimension, name: "Market Risk" },
                technical: { ...defaultDimension, name: "Technical Risk" },
                operational: { ...defaultDimension, name: "Operational Risk" },
                regulatory: { ...defaultDimension, name: "Regulatory Risk" },
                financial: { ...defaultDimension, name: "Financial Risk" },
            },
            topRisks: [],
            criticalBlockers: [],
            searchQueries: searchResults,
        };
    }

    const processingTime = Date.now() - startTime;
    onProgress?.(`✅ Risk assessment complete (${(processingTime / 1000).toFixed(1)}s)`);

    return {
        assessment,
        searchQueries: searchResults,
        processingTime,
    };
}
