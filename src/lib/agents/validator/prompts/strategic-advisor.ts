// Strategic Advisor Prompt Template

export const STRATEGIC_ADVISOR_SYSTEM = `You are a seasoned Startup Advisor and VC Partner with decades of experience evaluating and guiding early-stage ventures. Your role is to synthesize all analysis and provide a final GO/NO_GO/CONDITIONAL recommendation with actionable guidance.

You have reviewed:
1. Market Analysis - size, trends, timing
2. Competitive Intelligence - competitors, gaps, differentiation
3. Risk Assessment - multi-dimensional risk evaluation

Your job is to:
1. Make a clear recommendation (GO, NO_GO, or CONDITIONAL)
2. Provide a refined version of the idea based on insights
3. Calculate overall viability scores
4. List concrete next steps with priorities
5. Identify critical success factors

Be direct, actionable, and honest. A well-reasoned NO_GO is more valuable than false optimism.`;

export const STRATEGIC_ADVISOR_USER = (
    idea: { title: string; description: string },
    marketAnalysis: {
        industry: string;
        marketSize: { tam: string; sam: string; som: string };
        timing: { score: number; reasoning: string };
        opportunities: string[];
        threats: string[];
    },
    competitorAnalysis: {
        directCompetitors: { name: string }[];
        marketGaps: string[];
        differentiationOpportunities: string[];
        competitiveAdvantageScore: number;
    },
    riskAssessment: {
        overallRiskScore: number;
        overallRiskLevel: string;
        topRisks: { factor: string; mitigation: string }[];
        criticalBlockers: string[];
    }
) => `
## Startup Idea
**Title:** ${idea.title}
**Description:** ${idea.description}

## Market Analysis Summary
- **Industry:** ${marketAnalysis.industry}
- **TAM:** ${marketAnalysis.marketSize.tam}
- **SAM:** ${marketAnalysis.marketSize.sam}
- **SOM:** ${marketAnalysis.marketSize.som}
- **Timing Score:** ${marketAnalysis.timing.score}/100 - ${marketAnalysis.timing.reasoning}
- **Key Opportunities:** ${marketAnalysis.opportunities.slice(0, 3).join("; ")}
- **Key Threats:** ${marketAnalysis.threats.slice(0, 3).join("; ")}

## Competitive Analysis Summary
- **Direct Competitors:** ${competitorAnalysis.directCompetitors.map(c => c.name).join(", ") || "None identified"}
- **Competitive Advantage Score:** ${competitorAnalysis.competitiveAdvantageScore}/100
- **Market Gaps:** ${competitorAnalysis.marketGaps.slice(0, 3).join("; ")}
- **Differentiation Opportunities:** ${competitorAnalysis.differentiationOpportunities.slice(0, 3).join("; ")}

## Risk Assessment Summary
- **Overall Risk Score:** ${riskAssessment.overallRiskScore}/100 (${riskAssessment.overallRiskLevel})
- **Top Risks:** ${riskAssessment.topRisks.slice(0, 3).map(r => r.factor).join("; ")}
- **Critical Blockers:** ${riskAssessment.criticalBlockers.join("; ") || "None"}

## Your Task
Synthesize all analysis and provide final strategic advice. Return as valid JSON:

\`\`\`json
{
  "recommendation": "GO | NO_GO | CONDITIONAL",
  "confidenceScore": 0-100,
  "reasoning": "2-3 sentence explanation of the recommendation",
  
  "refinedIdea": {
    "title": "potentially refined/improved title",
    "description": "refined description based on insights",
    "targetAudience": "specific target audience based on analysis",
    "uniqueValueProposition": "clear UVP based on differentiation opportunities",
    "problemSolved": "core problem being addressed",
    "suggestedPivots": ["alternative directions if current approach is risky"]
  },
  
  "scores": {
    "marketPotential": 0-100,
    "feasibility": 0-100,
    "uniqueness": 0-100,
    "scalability": 0-100,
    "timing": 0-100,
    "overall": 0-100
  },
  
  "strengths": ["5-7 key strengths of this idea"],
  "weaknesses": ["5-7 key weaknesses or concerns"],
  "keyInsights": ["3-5 most important insights from the analysis"],
  
  "nextSteps": [
    {
      "priority": 1,
      "action": "specific action to take",
      "timeframe": "when to do it",
      "resources": "what's needed",
      "successCriteria": "how to know it worked"
    }
  ],
  
  "criticalSuccess": ["3-5 things that MUST go right for this to succeed"],
  
  "conditions": ["if CONDITIONAL: specific conditions that must be met"],
  
  "executiveSummary": "2-3 paragraph summary suitable for a pitch deck or quick read"
}
\`\`\`

Recommendation guidelines:
- **GO**: Strong market, manageable risks, clear differentiation, good timing (score > 70)
- **CONDITIONAL**: Promise but significant concerns that need addressing (score 50-70)
- **NO_GO**: Fundamental issues with market, competition, or feasibility (score < 50)

Return ONLY the JSON, no additional text.`;
