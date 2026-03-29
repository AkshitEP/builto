// Market Analyst Node - Stage 1 of Validation Pipeline

import { callLLMServer as callLLM } from "../../../llm/server-client";
import { MarketAnalysis, SearchQuery } from "../types";
import { MARKET_ANALYST_SYSTEM, MARKET_ANALYST_USER } from "../prompts/market-analyst";
import { webSearch, buildMarketQueries } from "../tools/web-search";

export interface MarketAnalystInput {
    idea: {
        title: string;
        description: string;
    };
}

export interface MarketAnalystOutput {
    analysis: MarketAnalysis;
    searchQueries: SearchQuery[];
    processingTime: number;
}

/**
 * Market Analyst Node
 * 
 * Performs comprehensive market analysis including:
 * - Market size estimation (TAM/SAM/SOM)
 * - Industry trends
 * - Target segments
 * - Timing analysis
 * - Opportunities & threats
 */
export async function marketAnalystNode(
    input: MarketAnalystInput,
    onProgress?: (message: string) => void
): Promise<MarketAnalystOutput> {
    const startTime = Date.now();

    onProgress?.("🔍 Building market research queries...");

    // Build search queries
    const queries = buildMarketQueries(input.idea);

    onProgress?.(`📊 Searching for market data (${queries.length} queries)...`);

    // Execute searches
    const searchResults: SearchQuery[] = [];
    for (const query of queries) {
        try {
            const result = await webSearch(query, { maxResults: 5 });
            searchResults.push(result);
            onProgress?.(`  ✓ Found ${result.results.length} results for "${query.slice(0, 40)}..."`);
        } catch (error) {
            console.error(`Search failed for: ${query}`, error);
        }
    }

    onProgress?.("🤖 Analyzing market data with AI...");

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
        systemPrompt: MARKET_ANALYST_SYSTEM,
        userPrompt: MARKET_ANALYST_USER(input.idea, formattedResults),
        temperature: 0.3, // Lower for more factual output
        maxTokens: 2000,
    });

    // Parse JSON response
    let analysis: MarketAnalysis;
    try {
        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        // Ensure all required fields exist
        analysis = {
            industry: parsed.industry || "technology",
            marketSize: {
                tam: parsed.marketSize?.tam || "Unknown",
                sam: parsed.marketSize?.sam || "Unknown",
                som: parsed.marketSize?.som || "Unknown",
                growthRate: parsed.marketSize?.growthRate,
                source: parsed.marketSize?.source,
            },
            trends: parsed.trends || [],
            targetSegments: (parsed.targetSegments || []).map((s: Record<string, unknown>) => ({
                name: s.name || "Unknown Segment",
                size: s.size || "Unknown",
                painPoints: s.painPoints || [],
                willingnessToPay: s.willingnessToPay || "medium",
            })),
            timing: {
                score: parsed.timing?.score || 50,
                reasoning: parsed.timing?.reasoning || "Unable to assess timing",
                factors: parsed.timing?.factors || [],
            },
            opportunities: parsed.opportunities || [],
            threats: parsed.threats || [],
            searchQueries: searchResults,
        };
    } catch (parseError) {
        console.error("Failed to parse market analysis:", parseError);
        console.error("Raw response:", response);

        // Return minimal fallback
        analysis = {
            industry: "technology",
            marketSize: { tam: "Unknown", sam: "Unknown", som: "Unknown" },
            trends: ["Unable to analyze trends"],
            targetSegments: [],
            timing: { score: 50, reasoning: "Unable to assess", factors: [] },
            opportunities: [],
            threats: [],
            searchQueries: searchResults,
        };
    }

    const processingTime = Date.now() - startTime;
    onProgress?.(`✅ Market analysis complete (${(processingTime / 1000).toFixed(1)}s)`);

    return {
        analysis,
        searchQueries: searchResults,
        processingTime,
    };
}
