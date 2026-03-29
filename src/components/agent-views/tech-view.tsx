"use client";

import { motion } from "framer-motion";
import {
    Code,
    Database,
    Server,
    Cloud,
    Layers,
    Cpu,
    Globe,
    Zap,
} from "lucide-react";

interface TechViewProps {
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

const stackIcons: Record<string, React.ReactNode> = {
    frontend: <Globe className="w-4 h-4" />,
    backend: <Server className="w-4 h-4" />,
    database: <Database className="w-4 h-4" />,
    infrastructure: <Cloud className="w-4 h-4" />,
    thirdParty: <Zap className="w-4 h-4" />,
};

export function TechView({ data }: TechViewProps) {
    if (!data) {
        return (
            <div className="h-full flex items-center justify-center text-[#555]">
                <p>No tech data available</p>
            </div>
        );
    }

    const projectName = String(get(data, "projectName", "Technical Architecture"));
    const techStack = get<Record<string, unknown>>(data, "techStack", {});
    const architecture = get<Record<string, unknown>>(data, "architecture", {});
    const mvpFeatures = getArray(data, "mvpFeatures");
    const api = get<Record<string, unknown>>(data, "api", {});
    const database = get<Record<string, unknown>>(data, "database", {});

    const stackCategories = ["frontend", "backend", "database", "infrastructure", "thirdParty"];

    return (
        <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a1a1a] to-[#1a1f1a] rounded-xl p-6 border border-[#2a2a2a]">
                    <h2 className="text-xl font-semibold text-white mb-2">{projectName}</h2>
                    {Object.keys(architecture).length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 font-medium">{String(get(architecture, "pattern", ""))}</span>
                            <span className="text-[#888] text-sm ml-2">{String(get(architecture, "description", ""))}</span>
                        </div>
                    )}
                </div>

                {/* Tech Stack */}
                {Object.keys(techStack).length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-purple-400" />
                            Technology Stack
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {stackCategories.map((category) => {
                                const items = getArray(techStack, category);
                                if (items.length === 0) return null;
                                return (
                                    <div key={category} className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a]">
                                        <div className="flex items-center gap-2 mb-3 text-[#888]">
                                            {stackIcons[category]}
                                            <span className="text-xs uppercase tracking-wider">{category}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {items.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md border border-[#2a2a2a]"
                                                >
                                                    {String(tech)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* MVP Features */}
                {mvpFeatures.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            MVP Features
                        </h3>
                        <div className="space-y-3">
                            {mvpFeatures.map((feature, i) => {
                                const f = feature as Record<string, unknown>;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-white font-medium">{String(get(f, "name", ""))}</span>
                                                <p className="text-xs text-[#888] mt-1">{String(get(f, "description", ""))}</p>
                                            </div>
                                            <span
                                                className={`text-xs px-2 py-1 rounded ${String(get(f, "priority", "")).toLowerCase() === "high"
                                                        ? "bg-red-400/20 text-red-400"
                                                        : String(get(f, "priority", "")).toLowerCase() === "medium"
                                                            ? "bg-yellow-400/20 text-yellow-400"
                                                            : "bg-green-400/20 text-green-400"
                                                    }`}
                                            >
                                                {String(get(f, "priority", "Medium"))}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* API Endpoints */}
                {getArray(api, "endpoints").length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Code className="w-4 h-4 text-green-400" />
                            API Endpoints ({getArray(api, "endpoints").length})
                        </h3>
                        <div className="space-y-2">
                            {getArray(api, "endpoints").map((endpoint, i) => {
                                const e = endpoint as Record<string, unknown>;
                                const method = String(get(e, "method", "GET"));
                                return (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
                                        <span
                                            className={`text-xs font-mono px-2 py-0.5 rounded ${method === "POST" ? "bg-green-400/20 text-green-400" :
                                                    method === "PUT" ? "bg-yellow-400/20 text-yellow-400" :
                                                        method === "DELETE" ? "bg-red-400/20 text-red-400" :
                                                            "bg-blue-400/20 text-blue-400"
                                                }`}
                                        >
                                            {method}
                                        </span>
                                        <span className="text-white font-mono text-sm">{String(get(e, "path", ""))}</span>
                                        <span className="text-[#888] text-xs ml-auto">{String(get(e, "description", ""))}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Database Schema */}
                {getArray(database, "schema").length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Database className="w-4 h-4 text-orange-400" />
                            Database Schema ({String(get(database, "type", ""))})
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {getArray(database, "schema").map((table, i) => {
                                const t = table as Record<string, unknown>;
                                return (
                                    <div key={i} className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                                        <span className="text-orange-400 font-mono text-sm">{String(get(t, "name", ""))}</span>
                                        <div className="mt-2 space-y-1">
                                            {getArray(t, "fields").map((field, j) => (
                                                <div key={j} className="text-xs text-[#888] font-mono pl-2 border-l border-[#2a2a2a]">
                                                    {String(field)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
