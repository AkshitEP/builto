"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
    Check,
    Zap,
    Crown,
    Users,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Free",
        price: "0",
        description: "Perfect for trying out Builto",
        prompts: 50,
        features: [
            "50 prompts/month",
            "5 AI Agents",
            "Basic validation",
            "Code export",
            "Community support",
        ],
        cta: "Get Started",
        popular: false,
        icon: Sparkles,
    },
    {
        name: "Pro",
        price: "19",
        description: "For serious startup builders",
        prompts: 500,
        features: [
            "500 prompts/month",
            "5 AI Agents + priority",
            "Advanced analytics",
            "Pitch deck generator",
            "Priority support",
            "Project history",
        ],
        cta: "Upgrade to Pro",
        popular: true,
        icon: Zap,
    },
    {
        name: "Team",
        price: "49",
        description: "For teams building together",
        prompts: -1,
        features: [
            "Unlimited prompts",
            "All Pro features",
            "Team collaboration",
            "Shared projects",
            "Custom agents",
            "Dedicated support",
            "API access",
        ],
        cta: "Contact Sales",
        popular: false,
        icon: Users,
    },
];

export default function PricingPage() {
    const { data: session } = useSession();
    const currentPlan = session?.user?.plan || "FREE";

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 mb-6"
                    >
                        <Crown className="w-4 h-4 text-lime-400" />
                        <span className="text-sm text-lime-400">Simple, transparent pricing</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        Choose Your Plan
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[#888] max-w-xl mx-auto"
                    >
                        Start free and scale as you grow. Pay only for what you use.
                    </motion.p>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => {
                        const isCurrentPlan = currentPlan === plan.name.toUpperCase();
                        const Icon = plan.icon;

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className={`relative rounded-2xl p-8 border ${plan.popular
                                        ? "bg-gradient-to-b from-lime-400/10 to-transparent border-lime-400/30"
                                        : "bg-[#1a1a1a] border-[#2a2a2a]"
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 bg-lime-400 text-black text-xs font-bold rounded-full">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg ${plan.popular ? "bg-lime-400/20" : "bg-[#2a2a2a]"
                                        }`}>
                                        <Icon className={`w-5 h-5 ${plan.popular ? "text-lime-400" : "text-[#888]"}`} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                                </div>

                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-[#888]">/month</span>
                                </div>

                                <p className="text-sm text-[#888] mb-6">{plan.description}</p>

                                <div className="mb-8">
                                    <div className="text-sm text-white font-medium mb-3">
                                        {plan.prompts === -1 ? "Unlimited" : plan.prompts} prompts/month
                                    </div>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-3 text-sm text-[#ccc]">
                                                <Check className="w-4 h-4 text-lime-400 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {isCurrentPlan ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-lg bg-[#2a2a2a] text-[#888] font-medium cursor-not-allowed"
                                    >
                                        Current Plan
                                    </button>
                                ) : (
                                    <Link
                                        href={plan.name === "Team" ? "/contact" : session ? "/checkout" : "/auth/signin"}
                                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors ${plan.popular
                                                ? "bg-lime-400 hover:bg-lime-300 text-black"
                                                : "bg-[#2a2a2a] hover:bg-[#333] text-white"
                                            }`}
                                    >
                                        {plan.cta}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ or additional info */}
                <div className="mt-16 text-center">
                    <p className="text-[#888]">
                        All plans include a 7-day money-back guarantee.{" "}
                        <Link href="/faq" className="text-lime-400 hover:underline">
                            View FAQ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
