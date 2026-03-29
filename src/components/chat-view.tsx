"use client";

import { motion } from "framer-motion";
import {
    MessageSquare,
    Paintbrush,
    GitBranch,
    Link2,
    Variable,
    Settings,
    ThumbsUp,
    ThumbsDown,
    Copy,
    RotateCcw,
    Sparkles,
    User,
    Loader2,
    CheckCircle2,
    Download,
    FolderOpen,
    Code,
    Eye,
    Shield,
    Map,
    Cpu,
    Briefcase,
    Rocket,
} from "lucide-react";
import { useState } from "react";
import { StartupState } from "@/store/startup-store";
import { FileTree, CodeViewer } from "./code-viewer";
import { LivePreview } from "./live-preview";
import { ValidatorView, PlannerView, TechView, BusinessView } from "./agent-views";

interface ChatViewProps {
    startup: StartupState;
    onApprove?: (ideaId: string) => void;
    onReject?: (ideaId: string) => void;
    onBack?: () => void;
}

const sideIcons = [
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "design", icon: Paintbrush, label: "Design" },
    { id: "git", icon: GitBranch, label: "Git" },
    { id: "connect", icon: Link2, label: "Connect" },
    { id: "vars", icon: Variable, label: "Vars" },
    { id: "settings", icon: Settings, label: "Settings" },
];

type AgentTab = "validator" | "planner" | "tech" | "business" | "developer";

const agentTabs: { id: AgentTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "validator", label: "Validation", icon: Shield },
    { id: "planner", label: "Planning", icon: Map },
    { id: "tech", label: "Tech", icon: Cpu },
    { id: "business", label: "Business", icon: Briefcase },
    { id: "developer", label: "MVP", icon: Rocket },
];

export function ChatView({ startup, onApprove, onReject }: ChatViewProps) {
    const [activeTool, setActiveTool] = useState("chat");
    const [followUp, setFollowUp] = useState("");
    const [activeAgentTab, setActiveAgentTab] = useState<AgentTab>("validator");
    const [codeViewMode, setCodeViewMode] = useState<"preview" | "code">("preview");
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

    const agents = ["validator", "planner", "tech", "business", "developer"] as const;
    const agentLabels = {
        validator: "Validator Agent",
        planner: "Planner Agent",
        tech: "Tech Agent",
        business: "Business Agent",
        developer: "Developer Agent",
    };

    // Only show approval when status explicitly requires it
    const needsApproval = ["validation_review", "planning_review", "tech_review", "developer_review"].includes(
        startup.status
    );

    // Get developer output for code view
    const developerOutput = startup.outputs.developer?.data as {
        plan?: { projectName: string };
        execution?: { codeGenerated: Record<string, string> };
    } | undefined;

    const generatedFiles = developerOutput?.execution?.codeGenerated || {};
    const hasGeneratedCode = Object.keys(generatedFiles).length > 0;
    const projectName = developerOutput?.plan?.projectName || "project";

    // Auto-select first file when code is generated
    if (hasGeneratedCode && !selectedFile) {
        const firstFile = Object.keys(generatedFiles)[0];
        if (firstFile) setSelectedFile(firstFile);
    }

    // Auto-switch to the latest active agent tab
    const getActiveAgentTab = (): AgentTab => {
        if (startup.outputs.developer) return "developer";
        if (startup.outputs.business) return "business";
        if (startup.outputs.tech) return "tech";
        if (startup.outputs.planner) return "planner";
        return "validator";
    };

    const handleExport = async () => {
        if (!projectName || !hasGeneratedCode) return;

        setIsExporting(true);
        setExportResult(null);

        try {
            const response = await fetch("/api/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectName,
                    files: generatedFiles,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setExportResult({
                    success: true,
                    message: `✅ Exported ${result.createdFiles.length} files to: generated/${projectName}`,
                });
            } else {
                setExportResult({
                    success: false,
                    message: `❌ Export failed: ${result.error}`,
                });
            }
        } catch (error) {
            setExportResult({
                success: false,
                message: `❌ Export failed: ${error instanceof Error ? error.message : String(error)}`,
            });
        } finally {
            setIsExporting(false);
        }
    };

    // Render agent content
    const renderAgentContent = () => {
        switch (activeAgentTab) {
            case "validator":
                return <ValidatorView data={startup.outputs.validator?.data as Record<string, unknown> | null} />;
            case "planner":
                return <PlannerView data={startup.outputs.planner?.data as Record<string, unknown> | null} />;
            case "tech":
                return <TechView data={startup.outputs.tech?.data as Record<string, unknown> | null} />;
            case "business":
                return (
                    <BusinessView
                        data={startup.outputs.business?.data as Record<string, unknown> | null}
                        ideaTitle={startup.idea.title}
                        ideaDescription={startup.idea.description}
                    />
                );
            case "developer":
                // Developer tab shows Preview/Code toggle
                return renderDeveloperContent();
            default:
                return null;
        }
    };

    const renderDeveloperContent = () => {
        return (
            <div className="h-full flex flex-col">
                {/* Preview/Code toggle for developer tab */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1f1f1f] bg-[#0f0f0f]">
                    <button
                        onClick={() => setCodeViewMode("preview")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${codeViewMode === "preview"
                            ? "bg-lime-400/20 text-lime-400"
                            : "text-[#666] hover:text-white"
                            }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                    </button>
                    <button
                        onClick={() => setCodeViewMode("code")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${codeViewMode === "code"
                            ? "bg-lime-400/20 text-lime-400"
                            : "text-[#666] hover:text-white"
                            }`}
                    >
                        <Code className="w-3.5 h-3.5" />
                        Code
                    </button>
                    <div className="flex-1" />
                    {hasGeneratedCode && (
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-400 hover:bg-lime-300 disabled:bg-lime-400/50 text-black text-xs font-medium rounded-lg transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {isExporting ? "Exporting..." : "Export"}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {codeViewMode === "preview" ? (
                        hasGeneratedCode ? (
                            <LivePreview files={generatedFiles} projectName={projectName} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#555]">
                                <Rocket className="w-12 h-12 mb-4 opacity-30" />
                                <p className="text-lg mb-2">No MVP preview available yet</p>
                                <p className="text-sm">Complete the Developer Agent to see your app</p>
                            </div>
                        )
                    ) : (
                        <div className="h-full flex">
                            {hasGeneratedCode ? (
                                <>
                                    <div className="w-56 border-r border-[#1f1f1f] bg-[#0f0f0f]">
                                        <div className="px-3 py-2 border-b border-[#1f1f1f]">
                                            <span className="text-xs font-medium text-[#888]">FILES</span>
                                        </div>
                                        <FileTree
                                            files={generatedFiles}
                                            onFileSelect={setSelectedFile}
                                            selectedFile={selectedFile}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        {selectedFile && generatedFiles[selectedFile] ? (
                                            <CodeViewer code={generatedFiles[selectedFile]} filename={selectedFile} />
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-[#555]">
                                                <p>Select a file to view</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[#555]">
                                    <Code className="w-12 h-12 mb-4 opacity-30" />
                                    <p className="text-lg mb-2">No code generated yet</p>
                                    <p className="text-sm">Complete the Developer Agent to see generated code</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full">
            {/* Side tool bar */}
            <div className="w-12 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col items-center py-4 gap-2">
                {sideIcons.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTool(item.id)}
                        className={`p-2 rounded-lg transition-colors ${activeTool === item.id
                            ? "bg-[#1f1f1f] text-lime-400"
                            : "text-[#555] hover:text-white hover:bg-[#1a1a1a]"
                            }`}
                        title={item.label}
                    >
                        <item.icon className="w-5 h-5" />
                    </button>
                ))}
            </div>

            {/* Chat panel */}
            <div className="w-80 bg-[#0f0f0f] border-r border-[#1f1f1f] flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b border-[#1f1f1f]">
                    <h2 className="text-sm font-medium text-white">{startup.idea.title}</h2>
                    <p className="text-xs text-[#666] mt-1 line-clamp-2">{startup.idea.description}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* User message */}
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white">{startup.idea.description}</p>
                        </div>
                    </div>

                    {/* Agent messages */}
                    {agents.map((agentKey) => {
                        const output = startup.outputs[agentKey];
                        const isCurrentAgent = startup.currentAgent === agentKey;
                        const isCompleted = !!output;

                        if (!isCompleted && !isCurrentAgent) return null;

                        return (
                            <div key={agentKey} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-lime-400/20 flex items-center justify-center flex-shrink-0">
                                    {isCurrentAgent && !isCompleted ? (
                                        <Loader2 className="w-3 h-3 text-lime-400 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3 h-3 text-lime-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            onClick={() => setActiveAgentTab(agentKey)}
                                            className="text-xs font-medium text-lime-400 hover:underline"
                                        >
                                            {agentLabels[agentKey]}
                                        </button>
                                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                    </div>
                                    {isCompleted ? (
                                        <p className="text-sm text-[#ccc]">{output.summary}</p>
                                    ) : (
                                        <p className="text-sm text-[#666]">
                                            {startup.agentStatus?.message || "Working..."}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    {isCompleted && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <button className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#555] hover:text-white transition-colors">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#555] hover:text-white transition-colors">
                                                <ThumbsDown className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#555] hover:text-white transition-colors">
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#555] hover:text-white transition-colors">
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Approval request - ONLY shows when needed */}
                    {needsApproval && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1a1a1a] border border-lime-400/30 rounded-lg p-4"
                        >
                            <p className="text-sm text-white mb-3">Ready to proceed to the next stage?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onApprove?.(startup.id)}
                                    className="flex-1 py-2 px-3 bg-lime-400 hover:bg-lime-300 text-black text-sm font-medium rounded-lg transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => onReject?.(startup.id)}
                                    className="flex-1 py-2 px-3 bg-[#2a2a2a] hover:bg-[#333] text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Export button - only when completed with generated code */}
                    {hasGeneratedCode && startup.status === "completed" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-lime-400/10 to-emerald-400/10 border border-lime-400/30 rounded-lg p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <FolderOpen className="w-4 h-4 text-lime-400" />
                                <span className="text-sm font-medium text-white">MVP Ready!</span>
                            </div>
                            <p className="text-xs text-[#888] mb-3">
                                {Object.keys(generatedFiles).length} files generated.
                            </p>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full py-2 px-3 bg-lime-400 hover:bg-lime-300 disabled:bg-lime-400/50 text-black text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Export MVP Files
                                    </>
                                )}
                            </button>
                            {exportResult && (
                                <p className={`text-xs mt-2 ${exportResult.success ? "text-emerald-400" : "text-red-400"}`}>
                                    {exportResult.message}
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#1f1f1f]">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={followUp}
                            onChange={(e) => setFollowUp(e.target.value)}
                            placeholder="Ask a follow-up..."
                            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#444]"
                        />
                    </div>
                </div>
            </div>

            {/* Main content panel with agent tabs */}
            <div className="flex-1 bg-[#0a0a0a] flex flex-col">
                {/* Agent tabs */}
                <div className="h-12 border-b border-[#1f1f1f] flex items-center px-2 bg-[#0f0f0f] overflow-x-auto">
                    {agentTabs.map((tab) => {
                        const hasOutput = !!startup.outputs[tab.id];
                        const isActive = activeAgentTab === tab.id;
                        const TabIcon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveAgentTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                    ? "bg-[#1f1f1f] text-white"
                                    : hasOutput
                                        ? "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                                        : "text-[#444] cursor-not-allowed"
                                    }`}
                                disabled={!hasOutput && tab.id !== "validator"}
                            >
                                <TabIcon className={`w-4 h-4 ${isActive ? "text-lime-400" : ""}`} />
                                {tab.label}
                                {hasOutput && (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {renderAgentContent()}
                </div>
            </div>
        </div>
    );
}
