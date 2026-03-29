import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // Fetch user with plan info
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: {
                        plan: true,
                        promptsUsed: true,
                        promptsLimit: true,
                    },
                });
                if (dbUser) {
                    session.user.plan = dbUser.plan;
                    session.user.promptsUsed = dbUser.promptsUsed;
                    session.user.promptsLimit = dbUser.promptsLimit;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "database",
    },
    debug: process.env.NODE_ENV === "development",
};

// Helper to check if user can make API call
export async function canUsePrompt(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, promptsUsed: true, promptsLimit: true, billingCycle: true },
    });

    if (!user) {
        return { allowed: false, remaining: 0, limit: 0 };
    }

    // Reset usage if billing cycle passed (monthly reset)
    const now = new Date();
    const cycleStart = new Date(user.billingCycle);
    const monthsDiff =
        (now.getFullYear() - cycleStart.getFullYear()) * 12 +
        (now.getMonth() - cycleStart.getMonth());

    if (monthsDiff >= 1) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                promptsUsed: 0,
                billingCycle: now,
            },
        });
        return { allowed: true, remaining: user.promptsLimit, limit: user.promptsLimit };
    }

    // Team plan has unlimited
    if (user.plan === "TEAM") {
        return { allowed: true, remaining: -1, limit: -1 };
    }

    const remaining = user.promptsLimit - user.promptsUsed;
    return {
        allowed: remaining > 0,
        remaining,
        limit: user.promptsLimit,
    };
}

// Increment prompt usage
export async function usePrompt(userId: string, count: number = 1): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            promptsUsed: { increment: count },
        },
    });
}

// Plan limits
export const PLAN_LIMITS = {
    FREE: 50,
    PRO: 500,
    TEAM: -1, // Unlimited
} as const;

export const PLAN_PRICES = {
    FREE: 0,
    PRO: 19,
    TEAM: 49,
} as const;
