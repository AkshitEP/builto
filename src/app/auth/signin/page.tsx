import { SignInButtons } from "@/components/auth";
import { Sparkles } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400/20 to-emerald-400/20 mb-4">
                        <Sparkles className="w-8 h-8 text-lime-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome to Builto</h1>
                    <p className="text-[#888] mt-2">
                        Sign in to build your startup with AI agents
                    </p>
                </div>

                {/* Sign in card */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
                    <SignInButtons callbackUrl="/" />

                    <div className="mt-6 text-center">
                        <p className="text-xs text-[#666]">
                            By signing in, you agree to our{" "}
                            <a href="/terms" className="text-lime-400 hover:underline">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-lime-400 hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-4">
                        <div className="text-2xl font-bold text-lime-400">50</div>
                        <div className="text-xs text-[#888] mt-1">Free prompts</div>
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-lime-400">5</div>
                        <div className="text-xs text-[#888] mt-1">AI Agents</div>
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-lime-400">∞</div>
                        <div className="text-xs text-[#888] mt-1">Ideas to build</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
