"use client";

import { useState } from "react";
import { Plus, ArrowUp, Sparkles } from "lucide-react";

interface PromptInputProps {
    onSubmit: (prompt: string, priority?: number) => void;
    isLoading?: boolean;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
    const [prompt, setPrompt] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = () => {
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
            setPrompt("");
            setIsExpanded(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Main prompt area */}
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your startup idea..."
                        rows={isExpanded ? 4 : 1}
                        className="w-full bg-transparent text-white placeholder-[#555] resize-none focus:outline-none text-base"
                        disabled={isLoading}
                    />
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-sm text-[#888] transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-sm text-[#888] transition-colors">
                            <Sparkles className="w-4 h-4 text-lime-400" />
                            <span>Builto</span>
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isLoading}
                        className="p-2 rounded-lg bg-white hover:bg-gray-200 disabled:bg-[#1a1a1a] disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowUp className={`w-4 h-4 ${prompt.trim() ? "text-black" : "text-[#555]"}`} />
                    </button>
                </div>
            </div>

            {/* Quick actions */}
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                <button
                    onClick={() => setPrompt("AI-powered recipe generator for busy professionals")}
                    className="px-4 py-2 rounded-full border border-[#2a2a2a] text-sm text-[#888] hover:text-white hover:border-[#444] transition-colors"
                >
                    + Recipe Generator
                </button>
                <button
                    onClick={() => setPrompt("Marketplace for freelance designers to sell UI kits")}
                    className="px-4 py-2 rounded-full border border-[#2a2a2a] text-sm text-[#888] hover:text-white hover:border-[#444] transition-colors"
                >
                    + Design Marketplace
                </button>
                <button
                    onClick={() => setPrompt("SaaS platform for remote team collaboration and project management")}
                    className="px-4 py-2 rounded-full border border-[#2a2a2a] text-sm text-[#888] hover:text-white hover:border-[#444] transition-colors"
                >
                    + Team Collab Tool
                </button>
            </div>
        </div>
    );
}
