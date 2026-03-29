"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    LogOut,
    Settings,
    CreditCard,
    ChevronDown,
    Zap,
} from "lucide-react";
import Link from "next/link";

export function UserMenu() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (!session?.user) return null;

    const { user } = session;
    const usagePercentage = user.promptsLimit > 0
        ? (user.promptsUsed / user.promptsLimit) * 100
        : 0;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-lime-400/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-lime-400" />
                    </div>
                )}
                <ChevronDown className={`w-4 h-4 text-[#888] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-20 overflow-hidden"
                        >
                            {/* User Info */}
                            <div className="p-4 border-b border-[#2a2a2a]">
                                <div className="flex items-center gap-3">
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name || "User"}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-lime-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {user.name || "User"}
                                        </p>
                                        <p className="text-xs text-[#888] truncate">{user.email}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.plan === "TEAM" ? "bg-purple-400/20 text-purple-400" :
                                            user.plan === "PRO" ? "bg-lime-400/20 text-lime-400" :
                                                "bg-[#2a2a2a] text-[#888]"
                                        }`}>
                                        {user.plan}
                                    </span>
                                </div>

                                {/* Usage bar */}
                                {user.plan !== "TEAM" && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-[#888]">Prompts used</span>
                                            <span className="text-white">
                                                {user.promptsUsed} / {user.promptsLimit}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${usagePercentage >= 90 ? "bg-red-400" :
                                                        usagePercentage >= 70 ? "bg-yellow-400" :
                                                            "bg-lime-400"
                                                    }`}
                                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Menu items */}
                            <div className="p-2">
                                <Link
                                    href="/settings"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2 rounded-lg text-[#ccc] hover:bg-[#2a2a2a] hover:text-white transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="text-sm">Settings</span>
                                </Link>
                                <Link
                                    href="/pricing"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2 rounded-lg text-[#ccc] hover:bg-[#2a2a2a] hover:text-white transition-colors"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-sm">Billing & Plans</span>
                                </Link>
                                {user.plan === "FREE" && (
                                    <Link
                                        href="/pricing"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 w-full p-2 rounded-lg bg-gradient-to-r from-lime-400/10 to-emerald-400/10 text-lime-400 hover:from-lime-400/20 hover:to-emerald-400/20 transition-colors"
                                    >
                                        <Zap className="w-4 h-4" />
                                        <span className="text-sm font-medium">Upgrade to Pro</span>
                                    </Link>
                                )}
                            </div>

                            {/* Sign out */}
                            <div className="p-2 border-t border-[#2a2a2a]">
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-3 w-full p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">Sign out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
