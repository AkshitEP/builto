"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    Target,
    Clock,
    CheckCircle2,
    ListTodo,
} from "lucide-react";

interface PlannerViewProps {
    data: Record<string, unknown> | null;
}

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
    const totalTasks = get<number>(data, "totalTasks", 0);
    const estimatedTime = String(get(data, "estimatedTime", ""));

    return (
        <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a1a1a] to-[#1f1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                    <h2 className="text-xl font-semibold text-white mb-2">{projectName}</h2>
                    {vision && <p className="text-sm text-[#888]">{vision}</p>}
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-lime-400" />
                            <span className="text-sm text-white">
                                {get<number>(timeline, "totalWeeks", 0)} weeks total
                            </span>
                        </div>
                        {totalTasks > 0 && (
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-white">{totalTasks} tasks</span>
                            </div>
                        )}
                        {estimatedTime && (
                            <div className="text-xs text-[#666]">
                                Est: {estimatedTime}
                            </div>
                        )}
                        {Object.keys(timeline).length > 1 && (
                            <div className="text-xs text-[#666]">
                                MVP: {get<number>(timeline, "mvpWeeks", 0)}w • Beta: {get<number>(timeline, "betaWeeks", 0)}w • Launch: {get<number>(timeline, "launchWeeks", 0)}w
                            </div>
                        )}
                    </div>
                </div>

                {/* Phases with Tasks */}
                {phases.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Project Phases
                        </h3>
                        <div className="space-y-4">
                            {phases.map((phase, i) => {
                                const p = phase as Record<string, unknown>;
                                const tasks = getArray(p, "tasks");
                                const objectives = getArray(p, "objectives");
                                const deliverables = getArray(p, "deliverables");
                                const description = String(get(p, "description", ""));

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

                                        {description && (
                                            <p className="text-xs text-[#888] mb-3">{description}</p>
                                        )}

                                        {/* New Planner 2.0: show tasks */}
                                        {tasks.length > 0 && (
                                            <div className="space-y-1.5">
                                                {tasks.map((task, j) => {
                                                    const t = task as Record<string, unknown>;
                                                    const title = String(get(t, "title", ""));
                                                    const status = String(get(t, "status", "pending"));
                                                    const agent = String(get(t, "assignedAgent", ""));

                                                    return (
                                                        <div key={j} className="flex items-start gap-2 text-xs">
                                                            {status === "completed" ? (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                            ) : (
                                                                <Target className="w-3.5 h-3.5 text-[#555] mt-0.5 flex-shrink-0" />
                                                            )}
                                                            <span className={status === "completed" ? "text-[#888] line-through" : "text-[#ccc]"}>
                                                                {title}
                                                            </span>
                                                            {agent && (
                                                                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#666] flex-shrink-0">
                                                                    {agent}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Legacy format: objectives + deliverables */}
                                        {tasks.length === 0 && (objectives.length > 0 || deliverables.length > 0) && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs text-[#888]">Objectives</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {objectives.map((obj, j) => (
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
                                                        {deliverables.map((del, j) => (
                                                            <li key={j} className="text-xs text-[#ccc] flex items-start gap-2">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
                                                                {String(del)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
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
