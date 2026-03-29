"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, Sparkles } from "lucide-react";

interface ProjectCardProps {
    title: string;
    date: string;
    status: "active" | "completed" | "paused";
    progress?: number;
    onClick?: () => void;
}

export function ProjectCard({ title, date, status, progress = 0, onClick }: ProjectCardProps) {
    const statusColors = {
        active: "bg-lime-400",
        completed: "bg-emerald-400",
        paused: "bg-yellow-400",
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl overflow-hidden text-left transition-all w-full"
        >
            {/* Preview area */}
            <div className="aspect-video bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent transition-opacity" />

                {/* Progress indicator */}
                {status === "active" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2a2a2a]">
                        <motion.div
                            className="h-full bg-lime-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                )}

                <Sparkles className="w-8 h-8 text-[#333]" />
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{title}</h3>
                        <p className="text-xs text-[#666] mt-0.5">{date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // More options
                            }}
                            className="p-1 rounded hover:bg-[#2a2a2a] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreHorizontal className="w-4 h-4 text-[#888]" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.button>
    );
}
