// Web Search Tool with Multiple Sources and Caching
// Primary: Tavily (AI-optimized), Fallback: DuckDuckGo

import { SearchResult, SearchQuery } from "../types";
import { tavily } from "@tavily/core";

// Simple in-memory cache
const searchCache = new Map<string, { results: SearchResult[]; timestamp: Date }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Tavily client (get free API key at tavily.com)
const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY || ""
});

// Rate limiting for DDG fallback
let lastSearchTime = 0;
const MIN_DELAY_MS = 2500;

/**
 * Delay helper for rate limiting
 */
async function rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastSearch = now - lastSearchTime;
    if (timeSinceLastSearch < MIN_DELAY_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_DELAY_MS - timeSinceLastSearch));
    }
    lastSearchTime = Date.now();
}

function normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, " ");
}

function isCacheValid(timestamp: Date): boolean {
    return Date.now() - timestamp.getTime() < CACHE_TTL_MS;
}

function getCached(query: string): SearchResult[] | null {
    const normalized = normalizeQuery(query);
    const cached = searchCache.get(normalized);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.results.map(r => ({ ...r, source: "cached" as const }));
    }
    return null;
}

function setCache(query: string, results: SearchResult[]): void {
    const normalized = normalizeQuery(query);
    searchCache.set(normalized, { results, timestamp: new Date() });
}

/**
 * Tavily search - AI-optimized, reliable, generous free tier
 */
async function searchTavily(query: string): Promise<SearchResult[]> {
    try {
        if (!process.env.TAVILY_API_KEY) {
            console.log("Tavily API key not set, skipping...");
            return [];
        }

        const response = await tavilyClient.search(query, {
            searchDepth: "basic",
            maxResults: 5,
        });

        return response.results.map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.content?.slice(0, 300) || "",
            source: "tavily" as const,
        }));
    } catch (error) {
        console.error("Tavily search failed:", error);
        return [];
    }
}

/**
 * DuckDuckGo search - Fallback with rate limiting
 */
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    try {
        await rateLimitDelay();
        const { search } = await import("duck-duck-scrape");

        const results = await search(query, {
            safeSearch: 0,
        });

        return results.results.slice(0, 5).map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.description,
            source: "duckduckgo" as const,
        }));
    } catch (error) {
        console.error("DuckDuckGo search failed:", error);
        return [];
    }
}

/**
 * Main search function - tries Tavily first, falls back to DDG
 */
export async function webSearch(
    query: string,
    options: {
        useCache?: boolean;
        maxResults?: number;
        sources?: ("tavily" | "duckduckgo")[];
    } = {}
): Promise<SearchQuery> {
    const {
        useCache = true,
        maxResults = 5,
        sources = ["tavily", "duckduckgo"], // Tavily first
    } = options;

    // Check cache first
    if (useCache) {
        const cached = getCached(query);
        if (cached && cached.length > 0) {
            return {
                query,
                results: cached.slice(0, maxResults),
                timestamp: new Date(),
                cached: true,
            };
        }
    }

    // Search from sources (Tavily preferred)
    const allResults: SearchResult[] = [];

    for (const source of sources) {
        try {
            let results: SearchResult[] = [];

            switch (source) {
                case "tavily":
                    results = await searchTavily(query);
                    break;
                case "duckduckgo":
                    results = await searchDuckDuckGo(query);
                    break;
            }

            allResults.push(...results);

            // If we have enough results, stop
            if (allResults.length >= maxResults) break;
        } catch (error) {
            console.error(`Search source ${source} failed:`, error);
        }
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueResults = allResults.filter(r => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    });

    const finalResults = uniqueResults.slice(0, maxResults);

    // Cache the results
    if (useCache && finalResults.length > 0) {
        setCache(query, finalResults);
    }

    return {
        query,
        results: finalResults,
        timestamp: new Date(),
        cached: false,
    };
}

/**
 * Build market research queries (limited to 2)
 */
export function buildMarketQueries(idea: { title: string; description: string }): string[] {
    const industry = extractIndustry(idea.description);
    return [
        `${idea.title} market size trends 2024`,
        `${industry} industry growth forecast`,
    ];
}

/**
 * Build competitor research queries (limited to 2)
 */
export function buildCompetitorQueries(idea: { title: string; description: string }): string[] {
    return [
        `${idea.title} competitors alternatives`,
        `best ${idea.title} apps startups 2024`,
    ];
}

/**
 * Build risk research queries (limited to 2)
 */
export function buildRiskQueries(idea: { title: string; description: string }): string[] {
    const industry = extractIndustry(idea.description);
    return [
        `${industry} startup challenges risks`,
        `${idea.title} regulations compliance`,
    ];
}

/**
 * Extract industry from description
 */
function extractIndustry(description: string): string {
    const industries: Record<string, string[]> = {
        "healthcare": ["health", "medical", "patient", "doctor", "wellness"],
        "fintech": ["finance", "payment", "banking", "investment", "crypto"],
        "edtech": ["education", "learning", "student", "course", "school"],
        "ecommerce": ["shop", "store", "retail", "buy", "marketplace"],
        "saas": ["software", "platform", "tool", "service", "subscription"],
        "ai": ["ai", "machine learning", "artificial intelligence", "automation"],
        "social": ["social", "community", "network", "connect"],
    };

    const desc = description.toLowerCase();
    for (const [industry, keywords] of Object.entries(industries)) {
        if (keywords.some(k => desc.includes(k))) {
            return industry;
        }
    }
    return "technology";
}

/**
 * Batch search for multiple queries (sequential to avoid rate limits)
 */
export async function batchSearch(
    queries: string[],
    options: Parameters<typeof webSearch>[1] = {}
): Promise<SearchQuery[]> {
    const results: SearchQuery[] = [];
    for (const query of queries) {
        const result = await webSearch(query, options);
        results.push(result);
    }
    return results;
}
