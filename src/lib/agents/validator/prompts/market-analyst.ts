// Market Analyst Prompt Template

export const MARKET_ANALYST_SYSTEM = `You are an expert Market Research Analyst specializing in startup and technology markets. Your role is to provide comprehensive market analysis based on the startup idea and web search results provided.

You have access to real-time web search data. Use it to ground your analysis in facts, not assumptions.

Your analysis must include:
1. Industry identification and classification
2. Market size estimation (TAM, SAM, SOM)
3. Market trends and growth projections
4. Target market segments with pain points
5. Timing analysis (why now?)
6. Opportunities and threats

Be specific with numbers and cite sources when available. If exact data isn't found, provide reasonable estimates with clear reasoning.`;

export const MARKET_ANALYST_USER = (
    idea: { title: string; description: string },
    searchResults: { query: string; results: { title: string; snippet: string; url: string }[] }[]
) => `
## Startup Idea
**Title:** ${idea.title}
**Description:** ${idea.description}

## Web Search Results
${searchResults.map(sq => `
### Search: "${sq.query}"
${sq.results.map((r, i) => `${i + 1}. **${r.title}**
   ${r.snippet}
   Source: ${r.url}`).join("\n")}
`).join("\n")}

## Your Task
Analyze this startup idea from a market perspective. Return your analysis as valid JSON matching this exact structure:

\`\`\`json
{
  "industry": "string - primary industry category",
  "marketSize": {
    "tam": "string - Total Addressable Market with number and explanation",
    "sam": "string - Serviceable Addressable Market",
    "som": "string - Serviceable Obtainable Market (realistic year 1-2)",
    "growthRate": "string - annual growth rate if found",
    "source": "string - primary data source"
  },
  "trends": ["array of 4-6 key market trends"],
  "targetSegments": [
    {
      "name": "segment name",
      "size": "estimated size",
      "painPoints": ["key problems they face"],
      "willingnessToPay": "low | medium | high"
    }
  ],
  "timing": {
    "score": 0-100,
    "reasoning": "why is now the right/wrong time",
    "factors": ["list of timing factors"]
  },
  "opportunities": ["4-6 market opportunities"],
  "threats": ["4-6 market threats"]
}
\`\`\`

Return ONLY the JSON, no additional text.`;
