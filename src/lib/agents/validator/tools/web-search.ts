// Web Search Tool — Tavily only (DDG disabled due to reliability issues on cloud)

import { SearchResult, SearchQuery } from "../types";

// Simple in-memory cache
const searchCache = new Map<string, { results: SearchResult[]; timestamp: Date }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, " ");
}

function getCached(query: string): SearchResult[] | null {
    const normalized = normalizeQuery(query);
    const cached = searchCache.get(normalized);
    if (cached && Date.now() - cached.timestamp.getTime() < CACHE_TTL_MS) {
        return cached.results.map(r => ({ ...r, source: "cached" as const }));
    }
    return null;
}

function setCache(query: string, results: SearchResult[]): void {
    searchCache.set(normalizeQuery(query), { results, timestamp: new Date() });
}

// Lazy Tavily client
let tavilyClient: Awaited<ReturnType<typeof initTavily>> | null = null;

async function initTavily() {
    if (!process.env.TAVILY_API_KEY) return null;
    try {
        const { tavily } = await import("@tavily/core");
        return tavily({ apiKey: process.env.TAVILY_API_KEY });
    } catch {
        return null;
    }
}

/**
 * Tavily search — primary and only search source
 */
async function searchTavily(query: string): Promise<SearchResult[]> {
    try {
        if (!tavilyClient) tavilyClient = await initTavily();
        if (!tavilyClient) {
            console.log("Tavily not available, skipping search");
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
 * Main search function — Tavily only, with cache
 */
export async function webSearch(
    query: string,
    options: { useCache?: boolean; maxResults?: number } = {}
): Promise<SearchQuery> {
    const { useCache = true, maxResults = 5 } = options;

    // Check cache
    if (useCache) {
        const cached = getCached(query);
        if (cached && cached.length > 0) {
            return { query, results: cached.slice(0, maxResults), timestamp: new Date(), cached: true };
        }
    }

    // Search via Tavily
    const results = await searchTavily(query);
    const finalResults = results.slice(0, maxResults);

    if (useCache && finalResults.length > 0) {
        setCache(query, finalResults);
    }

    return { query, results: finalResults, timestamp: new Date(), cached: false };
}

/**
 * Build market research queries
 */
export function buildMarketQueries(idea: { title: string; description: string }): string[] {
    const industry = extractIndustry(idea.description);
    return [
        `${idea.title} market size trends 2024`,
        `${industry} industry growth forecast`,
    ];
}

/**
 * Build competitor research queries
 */
export function buildCompetitorQueries(idea: { title: string; description: string }): string[] {
    return [
        `${idea.title} competitors alternatives`,
        `best ${idea.title} apps startups 2024`,
    ];
}

/**
 * Build risk research queries
 */
export function buildRiskQueries(idea: { title: string; description: string }): string[] {
    const industry = extractIndustry(idea.description);
    return [
        `${industry} startup challenges risks`,
        `${idea.title} regulations compliance`,
    ];
}

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
        if (keywords.some(k => desc.includes(k))) return industry;
    }
    return "technology";
}

/**
 * Batch search — sequential
 */
export async function batchSearch(
    queries: string[],
    options: Parameters<typeof webSearch>[1] = {}
): Promise<SearchQuery[]> {
    const results: SearchQuery[] = [];
    for (const query of queries) {
        results.push(await webSearch(query, options));
    }
    return results;
}
