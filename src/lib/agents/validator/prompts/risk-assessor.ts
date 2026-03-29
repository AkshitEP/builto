// Risk Assessor Prompt Template

export const RISK_ASSESSOR_SYSTEM = `You are an expert Risk Assessment Analyst specializing in startup ventures. Your role is to identify, analyze, and help mitigate risks across multiple dimensions.

You evaluate risks across 5 key dimensions:
1. **Market Risk** - Demand uncertainty, market dynamics, customer adoption
2. **Technical Risk** - Feasibility, complexity, technology dependencies
3. **Operational Risk** - Execution challenges, scaling, team requirements
4. **Regulatory Risk** - Legal compliance, industry regulations, data privacy
5. **Financial Risk** - Capital requirements, runway, revenue model viability

For each risk, provide actionable mitigation strategies. Be realistic but constructive.`;

export const RISK_ASSESSOR_USER = (
    idea: { title: string; description: string },
    marketAnalysis: { industry: string; timing: { score: number }; threats: string[] },
    competitorAnalysis: { directCompetitors: { name: string }[]; competitiveAdvantageScore: number },
    searchResults: { query: string; results: { title: string; snippet: string; url: string }[] }[]
) => `
## Startup Idea
**Title:** ${idea.title}
**Description:** ${idea.description}

## Context from Previous Analysis
**Industry:** ${marketAnalysis.industry}
**Timing Score:** ${marketAnalysis.timing.score}/100
**Known Threats:** ${marketAnalysis.threats.join(", ")}
**Number of Direct Competitors:** ${competitorAnalysis.directCompetitors.length}
**Competitive Advantage Score:** ${competitorAnalysis.competitiveAdvantageScore}/100

## Web Search Results (Regulations & Challenges)
${searchResults.map(sq => `
### Search: "${sq.query}"
${sq.results.map((r, i) => `${i + 1}. **${r.title}**
   ${r.snippet}
   Source: ${r.url}`).join("\n")}
`).join("\n")}

## Your Task
Perform comprehensive risk assessment. Return your analysis as valid JSON matching this exact structure:

\`\`\`json
{
  "overallRiskScore": 0-100,
  "overallRiskLevel": "low | medium | high | critical",
  "dimensions": {
    "market": {
      "name": "Market Risk",
      "score": 0-100,
      "level": "low | medium | high | critical",
      "factors": [
        {
          "factor": "specific risk factor",
          "level": "low | medium | high | critical",
          "impact": "what happens if this occurs",
          "likelihood": 1-10,
          "mitigation": "how to address it"
        }
      ],
      "overallMitigation": "summary of market risk mitigation strategy"
    },
    "technical": {
      "name": "Technical Risk",
      "score": 0-100,
      "level": "low | medium | high | critical",
      "factors": [...],
      "overallMitigation": "..."
    },
    "operational": {
      "name": "Operational Risk",
      "score": 0-100,
      "level": "low | medium | high | critical",
      "factors": [...],
      "overallMitigation": "..."
    },
    "regulatory": {
      "name": "Regulatory Risk",
      "score": 0-100,
      "level": "low | medium | high | critical",
      "factors": [...],
      "overallMitigation": "..."
    },
    "financial": {
      "name": "Financial Risk",
      "score": 0-100,
      "level": "low | medium | high | critical",
      "factors": [...],
      "overallMitigation": "..."
    }
  },
  "topRisks": [
    {
      "factor": "top 3-5 most critical risks across all dimensions",
      "level": "level",
      "impact": "impact",
      "likelihood": 1-10,
      "mitigation": "mitigation"
    }
  ],
  "criticalBlockers": ["any showstopper issues that must be addressed before proceeding"]
}
\`\`\`

Risk scores: 0-30 = low, 31-50 = medium, 51-75 = high, 76-100 = critical

Return ONLY the JSON, no additional text.`;
