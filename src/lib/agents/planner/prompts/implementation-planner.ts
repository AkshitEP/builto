// Implementation Planner Prompt - Create technical roadmap

export const IMPLEMENTATION_PLANNER_SYSTEM = `You are an expert software architect creating implementation plans for startup MVPs.

Your plans should:
1. Group changes by component/feature area
2. Specify exact files to create, modify, or delete
3. Include verification steps for testing
4. Be actionable and specific

Use the following file actions:
- [NEW]: Create a new file
- [MODIFY]: Update an existing file
- [DELETE]: Remove a file`;

export const IMPLEMENTATION_PLANNER_USER = (
    idea: { title: string; description: string },
    phases: { name: string; tasks: { title: string }[] }[],
    techSpec?: {
        techStack?: { frontend: string[]; backend: string[] };
        mvpFeatures?: { name: string; description: string }[];
    }
) => `
## Project: ${idea.title}
${idea.description}

## Phases & Tasks
${phases.map(p => `
### ${p.name}
${p.tasks.map(t => `- ${t.title}`).join("\n")}
`).join("\n")}

${techSpec ? `
## Technical Specification
**Frontend:** ${techSpec.techStack?.frontend?.join(", ") || "React/Next.js"}
**Backend:** ${techSpec.techStack?.backend?.join(", ") || "Node.js API Routes"}

**MVP Features:**
${techSpec.mvpFeatures?.map(f => `- ${f.name}: ${f.description}`).join("\n") || "Core features"}
` : ""}

## Your Task
Create a detailed implementation plan. Return as JSON:

\`\`\`json
{
  "goal": "Brief description of what we're building",
  "summary": "2-3 sentence overview of the implementation approach",
  "components": [
    {
      "name": "Authentication",
      "description": "User login and session management",
      "files": [
        {
          "action": "NEW",
          "path": "src/lib/auth.ts",
          "description": "NextAuth configuration with providers"
        },
        {
          "action": "MODIFY",
          "path": "src/app/layout.tsx",
          "description": "Wrap app with SessionProvider"
        }
      ]
    },
    {
      "name": "Database",
      "description": "Data persistence layer",
      "files": [
        {
          "action": "NEW",
          "path": "prisma/schema.prisma",
          "description": "Database schema with User and Project models"
        }
      ]
    }
  ],
  "verificationPlan": {
    "automated": [
      "Run npm run build to verify compilation",
      "Run npm run lint to check code quality"
    ],
    "manual": [
      "Test authentication flow in browser",
      "Verify all pages render correctly"
    ]
  }
}
\`\`\`

Return ONLY the JSON, no additional text.`;
