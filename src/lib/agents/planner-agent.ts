import { BaseAgent, AgentContext, AgentOutput } from "./base-agent";
import type { PlannerOutput, Phase } from "./planner/types";

export class PlannerAgent extends BaseAgent {
  name = "Planner";
  role = "Strategic Project Planner";

  systemPrompt = `You are an expert project manager creating structured task plans for startups.`;

  async execute(context: AgentContext): Promise<AgentOutput> {
    this.updateStatus({
      stage: "thinking",
      message: `Creating task breakdown for: ${context.ideaTitle}`,
    });

    try {
      // Get validation result if available
      const validatorOutput = context.previousOutputs.validator as {
        recommendation?: string;
        refinedIdea?: {
          title: string;
          description: string;
          targetAudience: string;
        };
      } | undefined;

      // Update progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 80) {
          progress += 15;
          const stage = progress < 40 ? "Decomposing tasks" : "Creating implementation plan";
          this.updateStatus({
            stage: "executing",
            message: `📋 ${stage}...`,
            progress,
          });
        }
      }, 3000);

      // Call the server-side planning API
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: context.ideaTitle,
          description: context.ideaDescription,
          validationResult: validatorOutput ? {
            recommendation: validatorOutput.recommendation,
            refinedIdea: validatorOutput.refinedIdea,
          } : undefined,
          techSpec: context.previousOutputs.tech,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Planning failed");
      }

      const result: PlannerOutput = await response.json();

      this.updateStatus({
        stage: "completed",
        message: `✅ Created ${result.totalTasks} tasks across ${result.phases.length} phases`,
        progress: 100,
      });

      // Build summary
      const phaseSummary = result.phases
        .map(p => `${p.name} (${p.tasks.length} tasks)`)
        .join(", ");

      return {
        success: true,
        data: {
          ...result,
          // Legacy format for compatibility
          vision: result.implementationPlan.goal,
          timeline: {
            totalWeeks: parseInt(result.estimatedTime) || 3,
            mvpWeeks: 2,
            betaWeeks: 2,
            launchWeeks: 1,
          },
        },
        summary: `📋 **${result.totalTasks} tasks** across ${result.phases.length} phases: ${phaseSummary}`,
        requiresApproval: true,
        approvalPrompt: this.buildApprovalPrompt(result),
      };
    } catch (error) {
      this.updateStatus({
        stage: "error",
        message: `Planning failed: ${error}`,
      });

      return {
        success: false,
        data: null,
        summary: `Planning error: ${error}`,
      };
    }
  }

  private buildApprovalPrompt(result: PlannerOutput): string {
    const taskBreakdown = result.phases
      .map(p => `**${p.name}:** ${p.tasks.length} tasks`)
      .join("\n");

    return `📋 **Project Plan Ready: ${result.projectName}**

${result.implementationPlan.goal}

**Task Breakdown:**
${taskBreakdown}

**Total:** ${result.totalTasks} tasks | **Est. Time:** ${result.estimatedTime}

Review the task breakdown and implementation plan. Approve to proceed with technical specification.`;
  }
}
