// Competitor Analyst Node - Stage 2 of Validation Pipeline

import { callLLMServer as callLLM } from "../../../llm/server-client";
import { CompetitorAnalysis, MarketAnalysis, SearchQuery } from "../types";
import { COMPETITOR_ANALYST_SYSTEM, COMPETITOR_ANALYST_USER } from "../prompts/competitor-analyst";
import { webSearch, buildCompetitorQueries } from "../tools/web-search";

export interface CompetitorAnalystInput {
    idea: {
        title: string;
        description: string;
    };
    marketAnalysis: MarketAnalysis;
}

export interface CompetitorAnalystOutput {
    analysis: CompetitorAnalysis;
    searchQueries: SearchQuery[];
    processingTime: number;
}

/**
 * Competitor Analyst Node
 * 
 * Performs comprehensive competitive analysis including:
 * - Direct competitor identification
 * - Indirect competitor analysis
 * - Market gaps identification
 * - Differentiation opportunities
 * - Competitive advantage scoring
 */
export async function competitorAnalystNode(
    input: CompetitorAnalystInput,
    onProgress?: (message: string) => void
): Promise<CompetitorAnalystOutput> {
    const startTime = Date.now();

    onProgress?.("🔍 Building competitor research queries...");

    // Build search queries
    const queries = buildCompetitorQueries(input.idea);

    onProgress?.(`🏢 Searching for competitors (${queries.length} queries)...`);

    // Execute searches
    const searchResults: SearchQuery[] = [];
    for (const query of queries) {
        try {
            const result = await webSearch(query, { maxResults: 6 });
            searchResults.push(result);
            onProgress?.(`  ✓ Found ${result.results.length} results for "${query.slice(0, 40)}..."`);
        } catch (error) {
            console.error(`Search failed for: ${query}`, error);
        }
    }

    onProgress?.("🤖 Analyzing competitive landscape with AI...");

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
        systemPrompt: COMPETITOR_ANALYST_SYSTEM,
        userPrompt: COMPETITOR_ANALYST_USER(
            input.idea,
            {
                industry: input.marketAnalysis.industry,
                targetSegments: input.marketAnalysis.targetSegments,
            },
            formattedResults
        ),
        temperature: 0.3,
        maxTokens: 2500,
    });

    // Parse JSON response
    let analysis: CompetitorAnalysis;
    try {
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        analysis = {
            directCompetitors: (parsed.directCompetitors || []).map((c: Record<string, unknown>) => ({
                name: c.name || "Unknown",
                website: c.website as string | undefined,
                description: c.description || "",
                founded: c.founded as string | undefined,
                funding: c.funding as string | undefined,
                strengths: c.strengths || [],
                weaknesses: c.weaknesses || [],
                pricing: c.pricing as string | undefined,
                marketShare: c.marketShare as string | undefined,
                targetAudience: c.targetAudience as string | undefined,
            })),
            indirectCompetitors: (parsed.indirectCompetitors || []).map((c: Record<string, unknown>) => ({
                name: c.name || "Unknown",
                description: c.description || "",
                strengths: c.strengths || [],
                weaknesses: c.weaknesses || [],
            })),
            alternativeSolutions: parsed.alternativeSolutions || [],
            marketGaps: parsed.marketGaps || [],
            differentiationOpportunities: parsed.differentiationOpportunities || [],
            competitiveAdvantageScore: parsed.competitiveAdvantageScore || 50,
            searchQueries: searchResults,
        };
    } catch (parseError) {
        console.error("Failed to parse competitor analysis:", parseError);
        console.error("Raw response:", response);

        analysis = {
            directCompetitors: [],
            indirectCompetitors: [],
            alternativeSolutions: [],
            marketGaps: ["Unable to identify market gaps"],
            differentiationOpportunities: [],
            competitiveAdvantageScore: 50,
            searchQueries: searchResults,
        };
    }

    const processingTime = Date.now() - startTime;
    onProgress?.(`✅ Competitor analysis complete (${(processingTime / 1000).toFixed(1)}s)`);

    return {
        analysis,
        searchQueries: searchResults,
        processingTime,
    };
}
