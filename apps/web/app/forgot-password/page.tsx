"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
      const redirectTo = `${baseUrl}/reset-password`;
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo,
      });
      if (error) {
        toast.error(error.message ?? "Could not send reset email.");
        return;
      }
      setSent(true);
      toast.success("Check your email for a reset link.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute left-[2%] top-[31%] h-[20rem] w-[20rem] rounded-full bg-white/[0.045] blur-[95px]" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:38px_38px] opacity-[0.04]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[min(96vw,80rem)] flex-col px-4 py-3 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mb-3 flex shrink-0 items-center justify-between sm:mb-4">
          <Link
            href="/"
            className="text-base font-medium uppercase tracking-[0.34em] text-[rgba(245,242,236,0.96)] transition-colors hover:text-white"
          >
            OutfAI
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-[36rem]">
            <div className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,14,0.72)] shadow-[0_24px_70px_-34px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:rounded-[1.25rem]">
              <div className="relative p-5 sm:p-6 lg:p-8">
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                    Reset password
                  </div>
                  <h1 className="mt-1.5 font-serif italic text-2xl leading-tight text-[rgba(248,244,238,0.9)] sm:text-3xl">
                    Forgot your password?
                  </h1>
                  <p className="mt-2 text-sm text-[rgba(242,236,227,0.6)]">
                    Enter your email and we&apos;ll send you a link to set a new
                    password.
                  </p>
                </div>

                {sent ? (
                  <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-white/[0.015] p-4">
                    <p className="text-sm text-[rgba(248,244,238,0.88)]">
                      If an account exists for that email, we sent a reset link.
                      Check your inbox and spam folder.
                    </p>
                    <Link
                      href="/login"
                      className="mt-4 inline-block text-sm text-[rgba(248,244,238,0.92)] underline underline-offset-4 hover:text-[rgba(214,188,140,0.96)]"
                    >
                      Back to sign in
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#050505]/[0.18] focus-within:border-[rgba(214,188,140,0.18)] focus-within:ring-2 focus-within:ring-[rgba(214,188,140,0.06)]">
                      <label className="block px-4 pt-3 pb-1.5 text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        className="w-full bg-transparent px-4 pb-3 text-sm text-[rgba(248,244,238,0.92)] outline-none placeholder:text-[rgba(240,229,205,0.22)]"
                        placeholder="you@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(245,240,232,1)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-[rgba(34,28,22,0.94)] shadow-[0_18px_42px_-24px_rgba(255,255,255,0.22)] transition-all hover:translate-y-[-1px] disabled:opacity-40"
                    >
                      {loading ? (
                        <>
                          Sending…
                          <span className="h-4 w-4 animate-spin rounded-full border border-[rgba(34,28,22,0.24)] border-t-[rgba(34,28,22,0.88)]" />
                        </>
                      ) : (
                        "Send reset link"
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-5 pt-4 border-t border-white/[0.08]">
                  <Link
                    href="/login"
                    className="text-sm text-[rgba(242,236,227,0.54)] hover:text-[rgba(248,244,238,0.92)]"
                  >
                    ← Back to sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
