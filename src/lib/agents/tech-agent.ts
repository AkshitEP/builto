import { BaseAgent, AgentContext, AgentOutput } from "./base-agent";

export class TechAgent extends BaseAgent {
  name = "Tech";
  role = "Technical Architect";

  systemPrompt = `You are a technical architect designing MVPs for startups. Be concise.

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no extra text):
{
  "projectName": "name",
  "techStack": {
    "frontend": ["React", "..."],
    "backend": ["Node.js", "..."],
    "database": ["PostgreSQL"],
    "infrastructure": ["Vercel", "..."]
  },
  "architecture": {
    "type": "Monolith or Microservices or Serverless",
    "description": "2-3 sentence overview",
    "components": [{"name": "...", "purpose": "...", "technology": "..."}]
  },
  "database": {
    "type": "PostgreSQL",
    "schema": [{"name": "Entity", "fields": ["id: uuid", "..."], "relationships": ["..."]}]
  },
  "api": {
    "style": "REST",
    "endpoints": [{"method": "GET", "path": "/api/...", "description": "..."}]
  },
  "mvpFeatures": [{"name": "...", "priority": "P0", "description": "...", "components": ["..."]}],
  "devTimeline": {"setup": "1 day", "core": "1 week", "testing": "3 days", "deployment": "1 day"},
  "securityConsiderations": ["..."],
  "scalabilityNotes": ["..."]
}

Keep it practical and concise. Max 5 components, 6 endpoints, 5 features, 4 schema entities.`;

  async execute(context: AgentContext): Promise<AgentOutput> {
    this.updateStatus({
      stage: "thinking",
      message: `Designing tech architecture for: ${context.ideaTitle}`,
      progress: 10,
    });

    const validatorOutput = context.previousOutputs.validator as {
      refinedIdea?: {
        title: string;
        description: string;
        targetAudience: string;
        revenueModel: string;
      };
    } | undefined;

    const refinedIdea = validatorOutput?.refinedIdea;

    const prompt = `Design the MVP tech spec for:
Title: ${refinedIdea?.title || context.ideaTitle}
Description: ${refinedIdea?.description || context.ideaDescription}
Target: ${refinedIdea?.targetAudience || "General users"}
Revenue: ${refinedIdea?.revenueModel || "TBD"}

Respond ONLY with the JSON object. No markdown. Keep it concise.`;

    try {
      this.updateStatus({
        stage: "executing",
        message: "Generating architecture and MVP spec...",
        progress: 50,
      });

      const response = await this.callLLM(prompt, {
        temperature: 0.5,
        maxTokens: 2048,
      });

      const result = this.parseJSON<Record<string, unknown>>(response);

      if (!result) {
        return {
          success: false,
          data: null,
          summary: "Failed to parse technical specification",
        };
      }

      const techStack = result.techStack as Record<string, string[]> | undefined;
      const mvpFeatures = result.mvpFeatures as Array<Record<string, unknown>> | undefined;
      const architecture = result.architecture as Record<string, unknown> | undefined;

      this.updateStatus({
        stage: "completed",
        message: "Tech spec complete!",
        progress: 100,
      });

      return {
        success: true,
        data: result,
        summary: `${architecture?.type || "Architecture"} with ${techStack?.frontend?.[0] || "React"} + ${techStack?.backend?.[0] || "Node.js"}. ${mvpFeatures?.length || 0} MVP features defined.`,
        requiresApproval: true,
        approvalPrompt: `Tech Agent designed a ${architecture?.type || "monolith"} architecture. Approve to proceed.`,
      };
    } catch (error) {
      this.updateStatus({
        stage: "error",
        message: `Technical design failed: ${error instanceof Error ? error.message : error}`,
      });

      return {
        success: false,
        data: null,
        summary: `Technical design error: ${error instanceof Error ? error.message : error}`,
      };
    }
  }
}
