"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Github } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "github", 
      });
    } catch (err) {
      console.error("GitHub login failed:", err);
      setError("Failed to sign in with GitHub. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div
        className="
          w-full max-w-6xl overflow-hidden
          rounded-xl border border-border bg-card
          shadow-2xl
        "
      >
        <div className="grid md:grid-cols-2 min-h-155">
          {/* LEFT: Marketing */}
          <div
            className="
              hidden md:flex flex-col items-center justify-center
              bg-linear-to-br from-card via-card to-background
              px-12 lg:px-16 text-center relative
            "
          >
            <div className="max-w-lg space-y-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <span className="text-4xl font-black tracking-tight text-primary">
                  AI
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                Cut code review time{" "}
                <span className="text-primary">in half</span>
              </h1>

              <p className="text-lg font-light text-muted-foreground leading-relaxed">
                AI that reviews pull requests like a senior engineer — finds
                bugs, enforces standards, and saves hours every week.
              </p>

              <p className="text-sm italic text-muted-foreground/70">
                “From 4-day review cycles to same-day merges.”
              </p>
            </div>
          </div>

          {/* RIGHT: Auth */}
          <div className="flex items-center justify-center bg-card px-8 sm:px-12 lg:px-16">
            <div className="w-full max-w-md space-y-9">
              {/* Mobile branding */}
              <div className="md:hidden text-center space-y-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <span className="text-3xl font-black text-primary">AI</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back
                </h1>
              </div>

              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Sign in to your workspace
                </h2>
                <p className="text-sm text-muted-foreground">
                  Continue with GitHub — fast & secure
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handleGithubLogin}
                disabled={isLoading}
                className="
                  w-full inline-flex items-center justify-center gap-3
                  rounded-lg bg-primary px-6 py-4
                  text-base font-medium text-primary-foreground
                  shadow-md transition-all
                  hover:bg-primary/95
                  active:scale-[0.98]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-background
                  disabled:opacity-60
                  disabled:pointer-events-none
                "
              >
                <Github size={20} strokeWidth={2.2} />
                {isLoading ? "Signing in..." : "Continue with GitHub"}
              </button>

              <p className="pt-8 text-center text-xs text-muted-foreground">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
