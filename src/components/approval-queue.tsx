"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Check, X, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";
import { ApprovalRequest } from "@/store/startup-store";

interface ApprovalQueueProps {
    approvals: ApprovalRequest[];
    onApprove: (ideaId: string) => void;
    onReject: (ideaId: string) => void;
}

export function ApprovalQueue({
    approvals,
    onApprove,
    onReject,
}: ApprovalQueueProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const formatTime = (date: Date) => {
        const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                        <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Approval Queue</h2>
                    {approvals.length > 0 && (
                        <span className="ml-auto px-2.5 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                            {approvals.length} pending
                        </span>
                    )}
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {approvals.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No pending approvals</p>
                        <p className="text-sm">Approvals will appear here when agents need your input</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {approvals.map((approval) => (
                            <motion.div
                                key={approval.ideaId}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="border-b border-slate-700/30 last:border-0"
                            >
                                <div className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                                            <Clock className="w-4 h-4 text-yellow-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs px-2 py-0.5 bg-slate-700/50 rounded-full text-slate-400 capitalize">
                                                    {approval.agent}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {formatTime(approval.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white mb-3">{approval.prompt}</p>

                                            {/* Expand/collapse output details */}
                                            <button
                                                onClick={() =>
                                                    setExpandedId(
                                                        expandedId === approval.ideaId ? null : approval.ideaId
                                                    )
                                                }
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-3"
                                            >
                                                <ChevronDown
                                                    className={`w-3 h-3 transition-transform ${expandedId === approval.ideaId ? "rotate-180" : ""
                                                        }`}
                                                />
                                                View details
                                            </button>

                                            {expandedId === approval.ideaId && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mb-3 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-300 overflow-auto max-h-40"
                                                >
                                                    <pre className="whitespace-pre-wrap">
                                                        {JSON.stringify(approval.output.data, null, 2)}
                                                    </pre>
                                                </motion.div>
                                            )}

                                            {/* Action buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onApprove(approval.ideaId)}
                                                    className="flex-1 py-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => onReject(approval.ideaId)}
                                                    className="flex-1 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
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
