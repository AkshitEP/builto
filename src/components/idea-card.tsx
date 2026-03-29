"use client";

import { motion } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Pause,
    Play,
    Trash2,
    ChevronDown,
    ChevronUp,
    Loader2,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { StartupState } from "@/store/startup-store";
import { getStatusInfo } from "@/lib/orchestrator/state-machine";

interface IdeaCardProps {
    startup: StartupState;
    onPause?: (id: string) => void;
    onResume?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const stageOrder = ["validator", "planner", "tech", "business"] as const;

export function IdeaCard({ startup, onPause, onResume, onDelete }: IdeaCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const statusInfo = getStatusInfo(startup.status);

    const getStageStatus = (stage: string) => {
        if (startup.outputs[stage]) return "completed";
        if (startup.currentAgent === stage) return "active";
        return "pending";
    };

    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            gray: "bg-slate-500",
            blue: "bg-blue-500",
            yellow: "bg-yellow-500",
            green: "bg-emerald-500",
            orange: "bg-orange-500",
            red: "bg-red-500",
        };
        return colors[color] || colors.gray;
    };

    const completedStages = stageOrder.filter((s) => startup.outputs[s]).length;
    const progress = (completedStages / stageOrder.length) * 100;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl"
        >
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            {startup.idea.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2">
                            {startup.idea.description}
                        </p>
                    </div>
                    <div
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                            statusInfo.color
                        )}`}
                    >
                        {statusInfo.label}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Stage indicators */}
                <div className="flex gap-2 mt-4">
                    {stageOrder.map((stage) => {
                        const status = getStageStatus(stage);
                        return (
                            <div
                                key={stage}
                                className={`flex-1 flex flex-col items-center gap-1`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${status === "completed"
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : status === "active"
                                                ? "bg-violet-500/20 text-violet-400"
                                                : "bg-slate-700/50 text-slate-500"
                                        }`}
                                >
                                    {status === "completed" ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : status === "active" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-500 capitalize">
                                    {stage}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Current agent status */}
                {startup.agentStatus && startup.currentAgent && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                            <span className="text-violet-400 font-medium capitalize">
                                {startup.currentAgent}:
                            </span>
                            <span className="text-slate-300">{startup.agentStatus.message}</span>
                        </div>
                    </div>
                )}

                {/* Error display */}
                {startup.error && (
                    <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                        <div className="flex items-center gap-2 text-sm text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span>{startup.error}</span>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Details
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                View Details
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        {startup.status === "paused" ? (
                            <button
                                onClick={() => onResume?.(startup.id)}
                                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="Resume"
                            >
                                <Play className="w-4 h-4" />
                            </button>
                        ) : !["completed", "rejected"].includes(startup.status) ? (
                            <button
                                onClick={() => onPause?.(startup.id)}
                                className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                title="Pause"
                            >
                                <Pause className="w-4 h-4" />
                            </button>
                        ) : null}
                        <button
                            onClick={() => onDelete?.(startup.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-700/50 bg-slate-800/30"
                >
                    <div className="p-5 space-y-4">
                        {stageOrder.map((stage) => {
                            const output = startup.outputs[stage];
                            if (!output) return null;

                            return (
                                <div key={stage} className="space-y-2">
                                    <h4 className="text-sm font-medium text-white capitalize flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        {stage} Agent
                                    </h4>
                                    <div className="p-3 bg-slate-900/50 rounded-lg">
                                        <p className="text-sm text-slate-300">{output.summary}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {Object.keys(startup.outputs).length === 0 && (
                            <div className="text-center py-4 text-slate-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No outputs yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
