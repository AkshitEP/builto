import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            plan: "FREE" | "PRO" | "TEAM";
            promptsUsed: number;
            promptsLimit: number;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        plan: "FREE" | "PRO" | "TEAM";
        promptsUsed: number;
        promptsLimit: number;
    }
}
