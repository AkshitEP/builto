"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { ActivityLogEntry } from "@/store/startup-store";

interface AgentFeedProps {
    activities: ActivityLogEntry[];
    maxItems?: number;
}

export function AgentFeed({ activities, maxItems = 20 }: AgentFeedProps) {
    const displayActivities = activities.slice(0, maxItems);

    const getIcon = (type: ActivityLogEntry["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case "warning":
                return <AlertCircle className="w-4 h-4 text-yellow-400" />;
            case "error":
                return <XCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    const getBorderColor = (type: ActivityLogEntry["type"]) => {
        switch (type) {
            case "success":
                return "border-l-emerald-500";
            case "warning":
                return "border-l-yellow-500";
            case "error":
                return "border-l-red-500";
            default:
                return "border-l-blue-500";
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
                    <span className="ml-auto text-xs text-slate-400">
                        {activities.length} events
                    </span>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {displayActivities.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No activity yet</p>
                        <p className="text-sm">Activity will appear here as agents work</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {displayActivities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`px-5 py-3 border-l-2 ${getBorderColor(
                                    activity.type
                                )} hover:bg-slate-800/50 transition-colors`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getIcon(activity.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200">{activity.message}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500">
                                                {formatTime(activity.timestamp)}
                                            </span>
                                            {activity.agent && (
                                                <span className="text-xs px-2 py-0.5 bg-slate-700/50 rounded-full text-slate-400 capitalize">
                                                    {activity.agent}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
