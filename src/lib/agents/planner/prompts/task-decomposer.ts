// Task Decomposer Prompt - Break startup idea into phases and tasks

export const TASK_DECOMPOSER_SYSTEM = `You are an expert project manager and startup advisor. Your role is to break down a startup idea into actionable phases and tasks.

Create a structured task breakdown that:
1. Divides work into logical phases (Foundation, Core Features, Polish, Launch)
2. Creates 15-25 specific, actionable tasks
3. Assigns each task to the appropriate agent
4. Keeps tasks granular enough to track progress

Agent assignments:
- "validator": Idea validation, market research
- "tech": Technical architecture, API design, database schema
- "business": Business model, pricing, go-to-market
- "developer": Code implementation, UI/UX, testing`;

export const TASK_DECOMPOSER_USER = (
    idea: { title: string; description: string },
    validationResult?: { recommendation: string; refinedIdea?: { targetAudience: string } }
) => `
## Startup Idea
**Title:** ${idea.title}
**Description:** ${idea.description}
${validationResult ? `
## Validation Result
**Recommendation:** ${validationResult.recommendation}
**Target Audience:** ${validationResult.refinedIdea?.targetAudience || "General"}
` : ""}

## Your Task
Create a comprehensive task breakdown for building this MVP. Return as JSON:

\`\`\`json
{
  "projectName": "project-name-kebab-case",
  "phases": [
    {
      "id": "phase-1",
      "name": "Foundation",
      "description": "Set up project structure and core infrastructure",
      "order": 1,
      "tasks": [
        {
          "id": "task-1-1",
          "title": "Initialize Next.js project with TypeScript",
          "description": "Set up the base project with proper configuration",
          "status": "pending",
          "phase": "Foundation",
          "assignedAgent": "developer"
        }
      ]
    },
    {
      "id": "phase-2", 
      "name": "Core Features",
      "description": "Build the main functionality",
      "order": 2,
      "tasks": [...]
    },
    {
      "id": "phase-3",
      "name": "Polish & Testing",
      "description": "Refine UI/UX and ensure quality",
      "order": 3,
      "tasks": [...]
    },
    {
      "id": "phase-4",
      "name": "Launch Prep",
      "description": "Prepare for deployment and launch",
      "order": 4,
      "tasks": [...]
    }
  ],
  "estimatedTime": "2-3 weeks"
}
\`\`\`

Create 15-25 total tasks across all phases. Each task should be specific and actionable.
Return ONLY the JSON, no additional text.`;
