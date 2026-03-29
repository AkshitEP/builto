import { BaseAgent, AgentContext, AgentOutput } from "./base-agent";

interface BusinessResult {
    executiveSummary: string;
    marketAnalysis: {
        marketSize: {
            tam: string;
            sam: string;
            som: string;
        };
        trends: string[];
        growthRate: string;
    };
    competitorAnalysis: Competitor[];
    customerPersonas: Persona[];
    valueProposition: {
        statement: string;
        keyBenefits: string[];
        differentiators: string[];
    };
    pricingStrategy: {
        model: string;
        tiers: PricingTier[];
        rationale: string;
    };
    goToMarket: {
        strategy: string;
        channels: Channel[];
        first90Days: Action[];
    };
    metrics: {
        north_star: string;
        kpis: KPI[];
    };
    financialProjections: {
        year1Revenue: string;
        breakEvenPoint: string;
        initialInvestment: string;
    };
}

interface Competitor {
    name: string;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
}

interface Persona {
    name: string;
    demographics: string;
    painPoints: string[];
    goals: string[];
    channels: string[];
}

interface PricingTier {
    name: string;
    price: string;
    features: string[];
    target: string;
}

interface Channel {
    name: string;
    strategy: string;
    budget: string;
    expectedCAC: string;
}

interface Action {
    week: string;
    action: string;
    goal: string;
}

interface KPI {
    name: string;
    target: string;
    frequency: string;
}

export class BusinessAgent extends BaseAgent {
    name = "Business";
    role = "Business Strategist & Market Analyst";

    systemPrompt = `You are an expert business strategist with deep experience in startup go-to-market strategies, market analysis, and growth planning.

YOUR TASK:
Create a comprehensive business strategy for the given startup idea. Include:
- Market analysis with TAM/SAM/SOM
- Competitor analysis
- Customer personas
- Pricing strategy
- Go-to-market plan
- Key metrics and KPIs

PRINCIPLES:
- Data-driven insights
- Realistic projections
- Focus on sustainable growth
- Customer-centric approach

RESPOND IN JSON FORMAT:
{
  "executiveSummary": "<2-3 sentence overview>",
  "marketAnalysis": {
    "marketSize": {
      "tam": "<Total Addressable Market>",
      "sam": "<Serviceable Addressable Market>",
      "som": "<Serviceable Obtainable Market>"
    },
    "trends": ["<trend 1>", ...],
    "growthRate": "<annual growth rate>"
  },
  "competitorAnalysis": [
    {
      "name": "<competitor name>",
      "strengths": ["<strength 1>", ...],
      "weaknesses": ["<weakness 1>", ...],
      "marketShare": "<estimated share>"
    }
  ],
  "customerPersonas": [
    {
      "name": "<persona name>",
      "demographics": "<age, location, income, etc>",
      "painPoints": ["<pain point 1>", ...],
      "goals": ["<goal 1>", ...],
      "channels": ["<channel 1>", ...]
    }
  ],
  "valueProposition": {
    "statement": "<value prop statement>",
    "keyBenefits": ["<benefit 1>", ...],
    "differentiators": ["<differentiator 1>", ...]
  },
  "pricingStrategy": {
    "model": "<subscription, freemium, etc>",
    "tiers": [
      {
        "name": "<tier name>",
        "price": "<price>",
        "features": ["<feature 1>", ...],
        "target": "<target customer>"
      }
    ],
    "rationale": "<why this pricing>"
  },
  "goToMarket": {
    "strategy": "<overall GTM strategy>",
    "channels": [
      {
        "name": "<channel name>",
        "strategy": "<how to use it>",
        "budget": "<monthly budget>",
        "expectedCAC": "<expected CAC>"
      }
    ],
    "first90Days": [
      {
        "week": "Week 1-2",
        "action": "<action>",
        "goal": "<goal>"
      }
    ]
  },
  "metrics": {
    "north_star": "<primary metric>",
    "kpis": [
      {
        "name": "<kpi name>",
        "target": "<target value>",
        "frequency": "daily|weekly|monthly"
      }
    ]
  },
  "financialProjections": {
    "year1Revenue": "<projected revenue>",
    "breakEvenPoint": "<when>",
    "initialInvestment": "<needed investment>"
  }
}`;

    async execute(context: AgentContext): Promise<AgentOutput> {
        this.updateStatus({
            stage: "thinking",
            message: `Analyzing market for: ${context.ideaTitle}`,
        });

        const validatorOutput = context.previousOutputs.validator as {
            refinedIdea?: {
                title: string;
                description: string;
                targetAudience: string;
                uniqueValue: string;
                revenueModel: string;
            };
        } | undefined;

        const refinedIdea = validatorOutput?.refinedIdea;

        const prompt = `
CREATE BUSINESS STRATEGY FOR THIS STARTUP:

Title: ${refinedIdea?.title || context.ideaTitle}

Description: ${refinedIdea?.description || context.ideaDescription}

Target Audience: ${refinedIdea?.targetAudience || "To be defined"}

Unique Value: ${refinedIdea?.uniqueValue || "To be defined"}

Revenue Model: ${refinedIdea?.revenueModel || "To be defined"}

Create a comprehensive business strategy in the specified JSON format.
`;

        try {
            this.updateStatus({
                stage: "executing",
                message: "Conducting market research and GTM planning...",
                progress: 50,
            });

            const response = await this.callLLM(prompt, { temperature: 0.6 });
            const result = this.parseJSON<BusinessResult>(response);

            if (!result) {
                return {
                    success: false,
                    data: null,
                    summary: "Failed to parse business strategy",
                };
            }

            this.updateStatus({
                stage: "completed",
                message: `Strategy complete: ${result.goToMarket.channels.length} channels identified`,
                progress: 100,
            });

            return {
                success: true,
                data: result,
                summary: `Market: ${result.marketAnalysis.marketSize.tam}. ${result.competitorAnalysis.length} competitors analyzed. GTM: ${result.goToMarket.strategy}`,
                requiresApproval: false,
            };
        } catch (error) {
            this.updateStatus({
                stage: "error",
                message: `Business analysis failed: ${error}`,
            });

            return {
                success: false,
                data: null,
                summary: `Business analysis error: ${error}`,
            };
        }
    }
}
