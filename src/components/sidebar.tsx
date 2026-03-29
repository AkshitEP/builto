"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    Search,
    Home,
    FolderOpen,
    Sparkles,
    Settings,
    ChevronDown,
    Plus,
    LayoutGrid,
    History,
    CreditCard,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./auth";

interface SidebarProps {
    activeItem?: string;
    onItemClick?: (item: string) => void;
    recentProjects?: Array<{ id: string; title: string; date: string }>;
}

export function Sidebar({ activeItem = "home", onItemClick, recentProjects = [] }: SidebarProps) {
    const [isRecentsOpen, setIsRecentsOpen] = useState(true);
    const { data: session } = useSession();

    const navItems = [
        { id: "search", icon: Search, label: "Search" },
        { id: "home", icon: Home, label: "Home" },
        { id: "projects", icon: FolderOpen, label: "Projects" },
        { id: "templates", icon: LayoutGrid, label: "Templates" },
    ];

    return (
        <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-400/20 to-emerald-400/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-lime-400" />
                    </div>
                    <span className="font-bold text-white">Builto</span>
                </Link>
                <UserMenu />
            </div>

            {/* New Chat Button */}
            <div className="px-4 pb-4">
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg text-white transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">New Chat</span>
                    <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
                </button>
            </div>

            {/* Usage indicator (for logged in users) */}
            {session?.user && session.user.plan !== "TEAM" && (
                <div className="px-4 pb-4">
                    <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-[#888]">Prompts</span>
                            <span className="text-white">
                                {session.user.promptsUsed} / {session.user.promptsLimit}
                            </span>
                        </div>
                        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${(session.user.promptsUsed / session.user.promptsLimit) >= 0.9
                                        ? "bg-red-400"
                                        : (session.user.promptsUsed / session.user.promptsLimit) >= 0.7
                                            ? "bg-yellow-400"
                                            : "bg-lime-400"
                                    }`}
                                style={{
                                    width: `${Math.min((session.user.promptsUsed / session.user.promptsLimit) * 100, 100)}%`,
                                }}
                            />
                        </div>
                        {(session.user.promptsUsed / session.user.promptsLimit) >= 0.8 && (
                            <Link
                                href="/pricing"
                                className="flex items-center gap-1 mt-2 text-xs text-lime-400 hover:underline"
                            >
                                <Zap className="w-3 h-3" />
                                Upgrade for more
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="px-2 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onItemClick?.(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeItem === item.id
                                ? "bg-[#1f1f1f] text-white"
                                : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Divider */}
            <div className="mx-4 my-4 border-t border-[#1f1f1f]" />

            {/* Recents */}
            <div className="px-2 flex-1 overflow-y-auto">
                <button
                    onClick={() => setIsRecentsOpen(!isRecentsOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#888] hover:text-white transition-colors"
                >
                    <History className="w-4 h-4" />
                    <span>Recents</span>
                    <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform ${isRecentsOpen ? "" : "-rotate-90"
                            }`}
                    />
                </button>

                {isRecentsOpen && (
                    <div className="mt-1 space-y-1">
                        {recentProjects.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-[#555]">No recent projects</p>
                        ) : (
                            recentProjects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => onItemClick?.(`project-${project.id}`)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                                >
                                    <Sparkles className="w-4 h-4 text-lime-400" />
                                    <span className="truncate">{project.title}</span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-[#1f1f1f] space-y-1">
                <Link
                    href="/pricing"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                    <CreditCard className="w-4 h-4" />
                    <span>Pricing</span>
                </Link>
                <button
                    onClick={() => onItemClick?.("settings")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
