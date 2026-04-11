"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  AuthStandaloneLayout,
  authStandaloneCardClass,
  authStandaloneFieldClass,
  authStandaloneLabelClass,
  authStandalonePrimaryButtonClass,
} from "@/components/marketing/auth-standalone-layout";
import { authInputClassName } from "@/components/marketing/form-panel";

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
    <AuthStandaloneLayout>
      <div className={authStandaloneCardClass}>
        <div className="mb-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
            Reset password
          </p>
          <h1 className="mt-2 font-serif text-2xl italic leading-tight tracking-tight text-foreground sm:text-3xl">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a link to set a new
            password.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4 dark:bg-muted/15">
            <p className="text-sm text-foreground">
              If an account exists for that email, we sent a reset link. Check
              your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--signal-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={authStandaloneFieldClass}>
              <label
                htmlFor="forgot-email"
                className={authStandaloneLabelClass}
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className={`${authInputClassName} px-4 pb-3`}
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={authStandalonePrimaryButtonClass}
            >
              {loading ? (
                <>
                  Sending…
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground motion-reduce:animate-none"
                    aria-hidden
                  />
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </AuthStandaloneLayout>
  );
}
