"use client";

import { motion } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Target,
    Users,
    Lightbulb,
    TrendingUp,
    Zap,
} from "lucide-react";

interface ValidatorViewProps {
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

function ScoreRing({ score, label, size = 60 }: { score: number; label: string; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const color = score >= 75 ? "#84cc16" : score >= 50 ? "#eab308" : "#ef4444";

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="rotate-[-90deg]">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#2a2a2a"
                        strokeWidth="4"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{score}</span>
                </div>
            </div>
            <span className="text-xs text-[#888] mt-2 text-center">{label}</span>
        </div>
    );
}

export function ValidatorView({ data }: ValidatorViewProps) {
    if (!data) {
        return (
            <div className="h-full flex items-center justify-center text-[#555]">
                <p>No validation data available</p>
            </div>
        );
    }

    const overallScore = get<number>(data, "overallScore", 0);
    const validated = get<boolean>(data, "validated", false);
    const refinedIdea = get<Record<string, unknown>>(data, "refinedIdea", {});
    const scores = get<Record<string, unknown>>(data, "scores", {});
    const strengths = getArray(data, "strengths");
    const weaknesses = getArray(data, "weaknesses");
    const recommendations = getArray(data, "recommendations");

    const scoreItems = [
        { key: "marketPotential", label: "Market" },
        { key: "feasibility", label: "Feasibility" },
        { key: "uniqueness", label: "Uniqueness" },
        { key: "scalability", label: "Scalability" },
        { key: "timing", label: "Timing" },
    ];

    return (
        <div className="h-full overflow-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Overall Score */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {validated ? (
                                <CheckCircle2 className="w-6 h-6 text-lime-400" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-400" />
                            )}
                            <span className="text-lg font-semibold text-white">
                                {validated ? "Validated" : "Needs Improvement"}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-lime-400">{overallScore}%</div>
                    </div>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all"
                            style={{ width: `${overallScore}%` }}
                        />
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                    <h3 className="text-sm font-medium text-white mb-4">Score Breakdown</h3>
                    <div className="flex justify-around">
                        {scoreItems.map((item) => (
                            <ScoreRing
                                key={item.key}
                                score={get<number>(scores, item.key, 0)}
                                label={item.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Refined Idea */}
                {Object.keys(refinedIdea).length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            Refined Idea
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-2xl font-bold text-white">
                                    {String(get(refinedIdea, "title", ""))}
                                </span>
                            </div>
                            <p className="text-[#ccc]">{String(get(refinedIdea, "description", ""))}</p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-[#0f0f0f] rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-xs text-[#888] mb-1">
                                        <Users className="w-3 h-3" /> Target Audience
                                    </div>
                                    <p className="text-sm text-white">{String(get(refinedIdea, "targetAudience", "N/A"))}</p>
                                </div>
                                <div className="bg-[#0f0f0f] rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-xs text-[#888] mb-1">
                                        <Target className="w-3 h-3" /> Problem Solved
                                    </div>
                                    <p className="text-sm text-white">{String(get(refinedIdea, "problemSolved", "N/A"))}</p>
                                </div>
                            </div>
                            <div className="bg-[#0f0f0f] rounded-lg p-3">
                                <div className="flex items-center gap-2 text-xs text-[#888] mb-1">
                                    <Zap className="w-3 h-3" /> Unique Value Proposition
                                </div>
                                <p className="text-sm text-white">{String(get(refinedIdea, "uniqueValueProposition", "N/A"))}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                    {strengths.length > 0 && (
                        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                Strengths
                            </h3>
                            <ul className="space-y-2">
                                {strengths.map((s, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-2 text-sm text-[#ccc]"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        {String(s)}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {weaknesses.length > 0 && (
                        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                Areas to Improve
                            </h3>
                            <ul className="space-y-2">
                                {weaknesses.map((w, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-2 text-sm text-[#ccc]"
                                    >
                                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                        {String(w)}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4">Recommendations</h3>
                        <div className="space-y-3">
                            {recommendations.map((r, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg"
                                >
                                    <span className="w-6 h-6 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center text-xs font-medium">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-[#ccc] flex-1">{String(r)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
