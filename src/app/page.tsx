"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { PromptInput } from "@/components/prompt-input";
import { ProjectCard } from "@/components/project-card";
import { ChatView } from "@/components/chat-view";
import { useStartupStore, StartupState } from "@/store/startup-store";
import {
  Orchestrator,
  getOrchestrator,
  OrchestratorEvent,
} from "@/lib/orchestrator";

type ViewMode = "home" | "project";

export default function Dashboard() {
  const {
    addStartup,
    updateStartup,
    removeStartup,
    addApproval,
    removeApproval,
    addActivity,
    getStartupsList,
  } = useStartupStore();

  const orchestratorRef = useRef<Orchestrator | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startups = getStartupsList();
  const activeProject = activeProjectId
    ? startups.find((s) => s.id === activeProjectId)
    : null;

  // Initialize orchestrator
  useEffect(() => {
    const orchestrator = getOrchestrator();
    orchestratorRef.current = orchestrator;

    const handleEvent = (event: OrchestratorEvent) => {
      switch (event.type) {
        case "idea_added":
          addStartup(event.idea);
          break;

        case "agent_started":
          updateStartup(event.ideaId, { currentAgent: event.agent });
          addActivity({
            type: "info",
            message: `${event.agent} agent started`,
            ideaId: event.ideaId,
            agent: event.agent,
          });
          break;

        case "agent_status":
          updateStartup(event.ideaId, { agentStatus: event.status });
          break;

        case "agent_completed":
          const currentStartup = getStartupsList().find((s) => s.id === event.ideaId);
          updateStartup(event.ideaId, {
            outputs: { ...currentStartup?.outputs, [event.agent]: event.output },
            currentAgent: null,
            agentStatus: null,
          });
          addActivity({
            type: "success",
            message: `${event.agent} completed`,
            ideaId: event.ideaId,
            agent: event.agent,
          });
          break;

        case "approval_requested":
          addApproval(event.request);
          // Update startup status
          const pipeline = orchestrator.getAllIdeas().find(
            (p) => p.idea.id === event.request.ideaId
          );
          if (pipeline) {
            updateStartup(event.request.ideaId, { status: pipeline.idea.status });
          }
          break;

        case "approval_resolved":
          removeApproval(event.ideaId);
          break;

        case "pipeline_completed":
          updateStartup(event.ideaId, { status: "completed" });
          addActivity({
            type: "success",
            message: "Pipeline completed!",
            ideaId: event.ideaId,
          });
          break;

        case "pipeline_error":
          updateStartup(event.ideaId, { error: event.error });
          break;
      }
    };

    const unsubscribe = orchestrator.subscribe(handleEvent);
    return () => unsubscribe();
  }, [addStartup, updateStartup, addApproval, removeApproval, addActivity, getStartupsList]);

  const handleSubmitIdea = useCallback(async (prompt: string) => {
    if (!orchestratorRef.current) return;

    setIsLoading(true);
    const idea = orchestratorRef.current.addIdea(
      prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
      prompt
    );

    // Switch to project view
    setActiveProjectId(idea.id);
    setViewMode("project");

    await orchestratorRef.current.processIdea(idea.id);
    setIsLoading(false);
  }, []);

  const handleApprove = useCallback(async (ideaId: string) => {
    if (!orchestratorRef.current) return;
    await orchestratorRef.current.handleApproval(ideaId, true);
  }, []);

  const handleReject = useCallback(async (ideaId: string) => {
    if (!orchestratorRef.current) return;
    await orchestratorRef.current.handleApproval(ideaId, false);
  }, []);

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    setViewMode("project");
  };

  const handleSidebarClick = (item: string) => {
    if (item === "home") {
      setViewMode("home");
      setActiveProjectId(null);
    } else if (item.startsWith("project-")) {
      const id = item.replace("project-", "");
      handleProjectClick(id);
    }
  };

  const recentProjects = startups.slice(0, 10).map((s) => ({
    id: s.id,
    title: s.idea.title,
    date: new Date(s.idea.createdAt).toLocaleDateString(),
  }));

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeItem={viewMode === "home" ? "home" : "projects"}
        onItemClick={handleSidebarClick}
        recentProjects={recentProjects}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              {/* Hero */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-3">
                  What startup will you build?
                </h1>
                <p className="text-[#666] text-lg">
                  Describe your idea and let AI agents validate, plan, and design it.
                </p>
              </div>

              {/* Prompt input */}
              <PromptInput onSubmit={handleSubmitIdea} isLoading={isLoading} />

              {/* Recent projects */}
              {startups.length > 0 && (
                <div className="w-full max-w-4xl mt-16">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-white">Recent Projects</h2>
                    <button className="flex items-center gap-1 text-sm text-[#888] hover:text-white transition-colors">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {startups.slice(0, 6).map((startup) => (
                      <ProjectCard
                        key={startup.id}
                        title={startup.idea.title}
                        date={formatDate(startup.idea.createdAt)}
                        status={
                          startup.status === "completed"
                            ? "completed"
                            : startup.status === "paused"
                              ? "paused"
                              : "active"
                        }
                        progress={
                          (Object.keys(startup.outputs).length / 5) * 100
                        }
                        onClick={() => handleProjectClick(startup.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeProject ? (
            <motion.div
              key="project"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden"
            >
              <ChatView
                startup={activeProject}
                onApprove={handleApprove}
                onReject={handleReject}
                onBack={() => {
                  setViewMode("home");
                  setActiveProjectId(null);
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
