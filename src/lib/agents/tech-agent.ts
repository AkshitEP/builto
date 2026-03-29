import { BaseAgent, AgentContext, AgentOutput } from "./base-agent";

interface TechResult {
    projectName: string;
    techStack: {
        frontend: string[];
        backend: string[];
        database: string[];
        infrastructure: string[];
        thirdParty: string[];
    };
    architecture: {
        type: string;
        description: string;
        components: Component[];
    };
    database: {
        type: string;
        schema: Entity[];
    };
    api: {
        style: string;
        endpoints: Endpoint[];
    };
    mvpFeatures: Feature[];
    devTimeline: {
        setup: string;
        core: string;
        testing: string;
        deployment: string;
    };
    securityConsiderations: string[];
    scalabilityNotes: string[];
}

interface Component {
    name: string;
    purpose: string;
    technology: string;
}

interface Entity {
    name: string;
    fields: string[];
    relationships: string[];
}

interface Endpoint {
    method: string;
    path: string;
    description: string;
}

interface Feature {
    name: string;
    priority: "P0" | "P1" | "P2";
    description: string;
    components: string[];
}

export class TechAgent extends BaseAgent {
    name = "Tech";
    role = "Technical Architect & Product Manager";

    systemPrompt = `You are an expert technical architect and product manager with deep experience in building MVPs for startups.

YOUR TASK:
Design the technical architecture and MVP specification for the given startup idea. Focus on:
- Choosing the right tech stack (modern, scalable, but not over-engineered)
- Defining clear MVP features (prioritized)
- Creating a practical database schema
- Specifying key API endpoints

PRINCIPLES:
- Start simple, plan for scale
- Use proven technologies
- Prioritize developer velocity for MVP
- Security from day one

RESPOND IN JSON FORMAT:
{
  "projectName": "<project name>",
  "techStack": {
    "frontend": ["<tech 1>", ...],
    "backend": ["<tech 1>", ...],
    "database": ["<tech 1>", ...],
    "infrastructure": ["<tech 1>", ...],
    "thirdParty": ["<service 1>", ...]
  },
  "architecture": {
    "type": "<e.g., Monolith, Microservices, Serverless>",
    "description": "<architecture overview>",
    "components": [
      {
        "name": "<component name>",
        "purpose": "<what it does>",
        "technology": "<tech used>"
      }
    ]
  },
  "database": {
    "type": "<e.g., PostgreSQL, MongoDB>",
    "schema": [
      {
        "name": "<entity name>",
        "fields": ["<field1: type>", ...],
        "relationships": ["<relation description>", ...]
      }
    ]
  },
  "api": {
    "style": "<REST, GraphQL, etc>",
    "endpoints": [
      {
        "method": "GET|POST|PUT|DELETE",
        "path": "/api/...",
        "description": "<what it does>"
      }
    ]
  },
  "mvpFeatures": [
    {
      "name": "<feature name>",
      "priority": "P0|P1|P2",
      "description": "<feature description>",
      "components": ["<component 1>", ...]
    }
  ],
  "devTimeline": {
    "setup": "<e.g., 2 days>",
    "core": "<e.g., 2 weeks>",
    "testing": "<e.g., 1 week>",
    "deployment": "<e.g., 2 days>"
  },
  "securityConsiderations": ["<security item 1>", ...],
  "scalabilityNotes": ["<scalability item 1>", ...]
}`;

    async execute(context: AgentContext): Promise<AgentOutput> {
        this.updateStatus({
            stage: "thinking",
            message: `Designing technical architecture for: ${context.ideaTitle}`,
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

        const plannerOutput = context.previousOutputs.planner as {
            phases?: Array<{ name: string; deliverables: string[] }>;
        } | undefined;

        const refinedIdea = validatorOutput?.refinedIdea;

        const prompt = `
DESIGN TECHNICAL ARCHITECTURE FOR THIS STARTUP:

Title: ${refinedIdea?.title || context.ideaTitle}

Description: ${refinedIdea?.description || context.ideaDescription}

Target Audience: ${refinedIdea?.targetAudience || "To be defined"}

Revenue Model: ${refinedIdea?.revenueModel || "To be defined"}

${plannerOutput?.phases ? `
PROJECT PHASES (from Planner):
${plannerOutput.phases.map((p) => `- ${p.name}: ${p.deliverables.join(", ")}`).join("\n")}
` : ""}

Create a comprehensive technical specification in the specified JSON format.
`;

        try {
            this.updateStatus({
                stage: "executing",
                message: "Designing architecture and MVP features...",
                progress: 50,
            });

            const response = await this.callLLM(prompt, { temperature: 0.5 });
            const result = this.parseJSON<TechResult>(response);

            if (!result) {
                return {
                    success: false,
                    data: null,
                    summary: "Failed to parse technical specification",
                };
            }

            const p0Features = result.mvpFeatures.filter((f) => f.priority === "P0").length;

            this.updateStatus({
                stage: "completed",
                message: `Tech spec complete: ${p0Features} core features defined`,
                progress: 100,
            });

            return {
                success: true,
                data: result,
                summary: `Tech stack: ${result.techStack.frontend[0]} + ${result.techStack.backend[0]}. ${result.mvpFeatures.length} MVP features. ${result.api.endpoints.length} API endpoints.`,
                requiresApproval: true,
                approvalPrompt: `The Tech Agent has designed the architecture using ${result.architecture.type}. Approve to proceed with business strategy.`,
            };
        } catch (error) {
            this.updateStatus({
                stage: "error",
                message: `Technical design failed: ${error}`,
            });

            return {
                success: false,
                data: null,
                summary: `Technical design error: ${error}`,
            };
        }
    }
}
