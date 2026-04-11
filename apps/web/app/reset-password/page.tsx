"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function cardWrap(content: React.ReactNode) {
  return (
    <AuthStandaloneLayout maxWidthClass="max-w-xl">
      <div className={authStandaloneCardClass}>{content}</div>
    </AuthStandaloneLayout>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (errorParam === "INVALID_TOKEN") {
      toast.error("This reset link is invalid or expired. Request a new one.");
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token. Use the link from your email.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword,
        token,
      });
      if (error) {
        toast.error(error.message ?? "Could not reset password.");
        return;
      }
      setSuccess(true);
      toast.success("Password updated. Sign in with your new password.");
      setTimeout(() => router.replace("/login"), 1500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !errorParam) {
    return cardWrap(
      <>
        <p className="text-sm text-muted-foreground">
          Use the link from your email to reset your password. If you don&apos;t
          have one,{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--signal-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            request a reset link
          </Link>
          .
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          ← Back to sign in
        </Link>
      </>
    );
  }

  if (errorParam === "INVALID_TOKEN") {
    return cardWrap(
      <>
        <h1 className="font-serif text-xl italic text-foreground">
          Invalid or expired link
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Request a new one
          below.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--signal-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          Request new reset link
        </Link>
        <Link
          href="/login"
          className="ml-6 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          Back to sign in
        </Link>
      </>
    );
  }

  if (success) {
    return cardWrap(
      <p className="text-center text-sm text-muted-foreground">
        Your password has been updated. Redirecting to sign in…
      </p>
    );
  }

  return (
    <AuthStandaloneLayout maxWidthClass="max-w-xl">
      <div className={authStandaloneCardClass}>
        <div className="mb-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
            Set new password
          </p>
          <h1 className="mt-2 font-serif text-2xl italic leading-tight tracking-tight text-foreground sm:text-3xl">
            Create a new password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={authStandaloneFieldClass}>
            <label htmlFor="reset-new" className={authStandaloneLabelClass}>
              New password
            </label>
            <input
              id="reset-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className={`${authInputClassName} px-4 pb-3`}
              placeholder="At least 8 characters"
            />
          </div>

          <div className={authStandaloneFieldClass}>
            <label htmlFor="reset-confirm" className={authStandaloneLabelClass}>
              Confirm password
            </label>
            <input
              id="reset-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className={`${authInputClassName} px-4 pb-3`}
              placeholder="Same as above"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={authStandalonePrimaryButtonClass}
          >
            {loading ? (
              <>
                Updating…
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground motion-reduce:animate-none"
                  aria-hidden
                />
              </>
            ) : (
              "Reset password"
            )}
          </button>
        </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
