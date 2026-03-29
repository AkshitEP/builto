"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    Target,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Flag,
} from "lucide-react";

interface PlannerViewProps {
    data: Record<string, unknown> | null;
}

// Helper to safely get value
function get<T>(obj: unknown, path: string, def: T): T {
    if (!obj || typeof obj !== "object") return def;
    const val = (obj as Record<string, unknown>)[path];
    return val !== undefined && val !== null ? (val as T) : def;
}

function getArray(obj: unknown, path: string): unknown[] {
    const val = get<unknown>(obj, path, null);
    return Array.isArray(val) ? val : [];
}

export function PlannerView({ data }: PlannerViewProps) {
    if (!data) {
        return (
            <div className="h-full flex items-center justify-center text-[#555]">
                <p>No planner data available</p>
            </div>
        );
    }

    const projectName = String(get(data, "projectName", "Project Plan"));
    const vision = String(get(data, "vision", ""));
    const phases = getArray(data, "phases");
    const timeline = get<Record<string, unknown>>(data, "timeline", {});
    const milestones = getArray(data, "milestones");
    const risks = getArray(data, "risks");

    return (
        <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a1a1a] to-[#1f1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                    <h2 className="text-xl font-semibold text-white mb-2">{projectName}</h2>
                    {vision && <p className="text-sm text-[#888]">{vision}</p>}
                    {Object.keys(timeline).length > 0 && (
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-lime-400" />
                                <span className="text-sm text-white">
                                    {get<number>(timeline, "totalWeeks", 0)} weeks total
                                </span>
                            </div>
                            <div className="text-xs text-[#666]">
                                MVP: {get<number>(timeline, "mvpWeeks", 0)}w • Beta: {get<number>(timeline, "betaWeeks", 0)}w • Launch: {get<number>(timeline, "launchWeeks", 0)}w
                            </div>
                        </div>
                    )}
                </div>

                {/* Phases */}
                {phases.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Project Phases
                        </h3>
                        <div className="space-y-4">
                            {phases.map((phase, i) => {
                                const p = phase as Record<string, unknown>;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a]"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-white flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-xs">
                                                    {i + 1}
                                                </span>
                                                {String(get(p, "name", `Phase ${i + 1}`))}
                                            </h4>
                                            <span className="text-xs text-[#888]">{String(get(p, "duration", ""))}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-[#888]">Objectives</span>
                                                <ul className="mt-1 space-y-1">
                                                    {getArray(p, "objectives").map((obj, j) => (
                                                        <li key={j} className="text-xs text-[#ccc] flex items-start gap-2">
                                                            <Target className="w-3 h-3 text-lime-400 mt-0.5" />
                                                            {String(obj)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="text-xs text-[#888]">Deliverables</span>
                                                <ul className="mt-1 space-y-1">
                                                    {getArray(p, "deliverables").map((del, j) => (
                                                        <li key={j} className="text-xs text-[#ccc] flex items-start gap-2">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
                                                            {String(del)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Milestones */}
                {milestones.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Flag className="w-4 h-4 text-purple-400" />
                            Key Milestones
                        </h3>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#2a2a2a]" />
                            <div className="space-y-4">
                                {milestones.map((ms, i) => {
                                    const m = ms as Record<string, unknown>;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="relative pl-10"
                                        >
                                            <div className="absolute left-2 w-5 h-5 rounded-full bg-purple-400/20 border-2 border-purple-400 flex items-center justify-center">
                                                <span className="text-[10px] text-purple-400 font-bold">{i + 1}</span>
                                            </div>
                                            <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-white">{String(get(m, "name", ""))}</span>
                                                    <span className="text-xs text-[#888]">Week {get<number>(m, "week", 0)}</span>
                                                </div>
                                                <p className="text-xs text-[#888] mt-1">{String(get(m, "description", ""))}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Risks */}
                {risks.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            Risk Assessment
                        </h3>
                        <div className="space-y-3">
                            {risks.map((risk, i) => {
                                const r = risk as Record<string, unknown>;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <span className="text-white font-medium">{String(get(r, "risk", ""))}</span>
                                                <p className="text-xs text-[#888] mt-1">
                                                    Mitigation: {String(get(r, "mitigation", ""))}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-xs px-2 py-1 rounded ${String(get(r, "impact", "")).toLowerCase().includes("high")
                                                        ? "bg-red-400/20 text-red-400"
                                                        : String(get(r, "impact", "")).toLowerCase().includes("medium")
                                                            ? "bg-yellow-400/20 text-yellow-400"
                                                            : "bg-green-400/20 text-green-400"
                                                    }`}
                                            >
                                                {String(get(r, "impact", "Medium"))}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
