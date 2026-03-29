"use client";

import { useState } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";

interface IdeaFormProps {
    onSubmit: (title: string, description: string, priority?: number) => void;
    isLoading?: boolean;
}

export function IdeaForm({ onSubmit, isLoading }: IdeaFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState(50);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && description.trim()) {
            onSubmit(title.trim(), description.trim(), priority);
            setTitle("");
            setDescription("");
            setPriority(50);
            setIsExpanded(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Add New Startup Idea</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Idea Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., AI-powered recipe generator"
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                            onFocus={() => setIsExpanded(true)}
                        />
                    </div>

                    <div
                        className={`transition-all duration-300 ${isExpanded ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
                            }`}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your startup idea. What problem does it solve? Who is the target audience?"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Priority Hint: {priority}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={priority}
                                    onChange={(e) => setPriority(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Low</span>
                                    <span>Medium</span>
                                    <span>High</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !title.trim() || !description.trim()}
                                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Launch Idea
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
