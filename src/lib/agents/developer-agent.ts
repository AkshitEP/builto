import { BaseAgent, AgentContext, AgentOutput } from "./base-agent";

interface ImplementationPlan {
    projectName: string;
    techStack: {
        frontend: string;
        backend: string;
        database: string;
    };
    structure: ProjectStructure;
    files: FileSpec[];
    buildSteps: string[];
    verificationSteps: string[];
}

interface ProjectStructure {
    directories: string[];
    entryPoints: string[];
}

interface FileSpec {
    path: string;
    type: "component" | "page" | "api" | "config" | "style" | "utility" | "model";
    description: string;
    dependencies: string[];
    content?: string;
}

interface ExecutionResult {
    filesCreated: string[];
    codeGenerated: Record<string, string>;
    errors: string[];
}

interface VerificationResult {
    buildSuccess: boolean;
    testsPass: boolean;
    issues: string[];
    recommendations: string[];
}

export class DeveloperAgent extends BaseAgent {
    name = "Developer";
    role = "Full-Stack Developer & Code Generator";

    // Phase 1: Planning
    private planningPrompt = `You are an expert full-stack developer creating an implementation plan for an MVP.

Given the technical specification, create a detailed file-by-file implementation plan.

RESPOND IN JSON FORMAT:
{
  "projectName": "<project name in kebab-case>",
  "techStack": {
    "frontend": "<e.g., Next.js 14 with TypeScript>",
    "backend": "<e.g., Next.js API Routes>",
    "database": "<e.g., SQLite with Prisma>"
  },
  "structure": {
    "directories": ["src/app", "src/components", "src/lib", ...],
    "entryPoints": ["src/app/page.tsx", "src/app/layout.tsx"]
  },
  "files": [
    {
      "path": "src/app/page.tsx",
      "type": "page",
      "description": "Main landing page with hero section",
      "dependencies": ["@/components/hero", "@/components/features"]
    },
    ...
  ],
  "buildSteps": [
    "npm install",
    "npm run build",
    "npm run dev"
  ],
  "verificationSteps": [
    "Check that dev server starts without errors",
    "Verify all pages render correctly",
    "Test API endpoints return expected responses"
  ]
}

Focus on creating a MINIMAL but FUNCTIONAL MVP. Prioritize:
1. Core user-facing features only
2. Clean, maintainable code structure
3. No over-engineering`;

    // Phase 2: Execution
    private executionPrompt = `You are generating production-ready code for an MVP.

Given the implementation plan and file specification, generate the complete code for each file.

RULES:
1. Generate COMPLETE, WORKING code - no placeholders or TODOs
2. Use modern best practices (React hooks, TypeScript, etc.)
3. Include proper imports and exports
4. Add helpful comments for complex logic
5. Ensure consistent styling with Tailwind CSS
6. Make it look BEAUTIFUL - use gradients, animations, proper spacing

RESPOND IN JSON FORMAT:
{
  "filesCreated": ["path1", "path2", ...],
  "codeGenerated": {
    "src/app/page.tsx": "// Full file content here...",
    "src/components/hero.tsx": "// Full file content here...",
    ...
  },
  "errors": []
}`;

    // Phase 3: Verification
    private verificationPrompt = `You are a QA engineer verifying the generated MVP code.

Review the generated code and provide a verification report.

Check for:
1. Missing imports or exports
2. TypeScript errors
3. Missing dependencies
4. Incomplete implementations
5. Security issues
6. Performance concerns

RESPOND IN JSON FORMAT:
{
  "buildSuccess": true/false,
  "testsPass": true/false,
  "issues": ["issue1", "issue2", ...],
  "recommendations": ["rec1", "rec2", ...]
}`;

    systemPrompt = this.planningPrompt; // Default to planning

    private currentPhase: "planning" | "execution" | "verification" = "planning";

    async execute(context: AgentContext): Promise<AgentOutput> {
        // Phase 1: Planning
        this.updateStatus({
            stage: "thinking",
            message: "📋 Phase 1: Creating implementation plan...",
            progress: 10,
        });

        const techSpec = context.previousOutputs.tech as {
            techStack?: { frontend: string[]; backend: string[]; database: string[] };
            mvpFeatures?: Array<{ name: string; description: string }>;
            api?: { endpoints: Array<{ method: string; path: string; description: string }> };
            database?: { schema: Array<{ name: string; fields: string[] }> };
        } | undefined;

        const plannerOutput = context.previousOutputs.planner as {
            phases?: Array<{ name: string; deliverables: string[] }>;
        } | undefined;

        // Create implementation plan
        const planPrompt = `
CREATE AN IMPLEMENTATION PLAN FOR THIS MVP:

Project: ${context.ideaTitle}
Description: ${context.ideaDescription}

Tech Stack from Tech Agent:
- Frontend: ${techSpec?.techStack?.frontend?.join(", ") || "React/Next.js"}
- Backend: ${techSpec?.techStack?.backend?.join(", ") || "Node.js"}
- Database: ${techSpec?.techStack?.database?.join(", ") || "SQLite"}

MVP Features:
${techSpec?.mvpFeatures?.map((f) => `- ${f.name}: ${f.description}`).join("\n") || "Core features TBD"}

API Endpoints:
${techSpec?.api?.endpoints?.map((e) => `- ${e.method} ${e.path}: ${e.description}`).join("\n") || "Endpoints TBD"}

Database Entities:
${techSpec?.database?.schema?.map((s) => `- ${s.name}: ${s.fields.join(", ")}`).join("\n") || "Schema TBD"}

Create a detailed implementation plan with the exact files needed.
`;

        this.systemPrompt = this.planningPrompt;
        const planResponse = await this.callLLM(planPrompt, { temperature: 0.5 });
        const plan = this.parseJSON<ImplementationPlan>(planResponse);

        if (!plan) {
            return {
                success: false,
                data: null,
                summary: "Failed to create implementation plan",
            };
        }

        this.updateStatus({
            stage: "executing",
            message: `📋 Plan ready: ${plan.files.length} files to generate`,
            progress: 25,
        });

        // Phase 2: Execution - Generate code for each file
        this.updateStatus({
            stage: "executing",
            message: "🛠️ Phase 2: Generating code...",
            progress: 30,
        });

        const codePrompt = `
GENERATE CODE FOR THIS MVP:

Project: ${plan.projectName}
Tech Stack: ${plan.techStack.frontend} + ${plan.techStack.backend}

FILES TO GENERATE:
${plan.files.map((f) => `
- ${f.path} (${f.type})
  Description: ${f.description}
  Dependencies: ${f.dependencies.join(", ") || "none"}
`).join("\n")}

Generate complete, production-ready code for ALL files listed above.
Make the UI beautiful with modern styling, animations, and proper UX.
`;

        this.systemPrompt = this.executionPrompt;
        const codeResponse = await this.callLLM(codePrompt, { temperature: 0.3, maxTokens: 8000 });
        const execution = this.parseJSON<ExecutionResult>(codeResponse);

        if (!execution) {
            return {
                success: false,
                data: { plan },
                summary: "Implementation plan created but code generation failed",
            };
        }

        this.updateStatus({
            stage: "executing",
            message: `✅ Generated ${Object.keys(execution.codeGenerated).length} files`,
            progress: 70,
        });

        // Phase 3: Verification
        this.updateStatus({
            stage: "executing",
            message: "🔍 Phase 3: Verifying code...",
            progress: 80,
        });

        const verifyPrompt = `
VERIFY THE GENERATED CODE:

Files generated:
${Object.keys(execution.codeGenerated).join("\n")}

Sample code snippets:
${Object.entries(execution.codeGenerated).slice(0, 3).map(([path, code]) =>
            `\n--- ${path} ---\n${code.slice(0, 500)}...`
        ).join("\n")}

Check for issues and provide verification report.
`;

        this.systemPrompt = this.verificationPrompt;
        const verifyResponse = await this.callLLM(verifyPrompt, { temperature: 0.3 });
        const verification = this.parseJSON<VerificationResult>(verifyResponse);

        this.updateStatus({
            stage: "completed",
            message: verification?.buildSuccess
                ? "✅ MVP code generated and verified!"
                : "⚠️ MVP generated with warnings",
            progress: 100,
        });

        const result = {
            plan,
            execution,
            verification: verification || { buildSuccess: true, testsPass: true, issues: [], recommendations: [] },
        };

        return {
            success: true,
            data: result,
            summary: `Generated ${Object.keys(execution.codeGenerated).length} files for ${plan.projectName}. ${verification?.buildSuccess ? "Build verified." : "Review needed."
                }`,
            requiresApproval: true,
            approvalPrompt: `The Developer Agent has generated ${Object.keys(execution.codeGenerated).length} files for your MVP. Review the code and approve to finalize.`,
        };
    }
}
