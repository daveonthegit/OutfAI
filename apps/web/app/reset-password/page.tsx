"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

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
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-background text-foreground">
        <div className="w-full max-w-[36rem] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,14,0.72)] p-6 sm:p-8">
          <p className="text-sm text-[rgba(242,236,227,0.7)]">
            Use the link from your email to reset your password. If you
            don&apos;t have one,{" "}
            <Link
              href="/forgot-password"
              className="text-[rgba(248,244,238,0.92)] underline hover:text-[rgba(214,188,140,0.96)]"
            >
              request a reset link
            </Link>
            .
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm text-[rgba(242,236,227,0.54)] hover:text-foreground"
          >
            ← Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  if (errorParam === "INVALID_TOKEN") {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-background text-foreground">
        <div className="w-full max-w-[36rem] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,14,0.72)] p-6 sm:p-8">
          <h1 className="font-serif text-xl italic text-foreground">
            Invalid or expired link
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Request a new
            one below.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-sm font-medium text-[rgba(248,244,238,0.92)] underline hover:text-[rgba(214,188,140,0.96)]"
          >
            Request new reset link
          </Link>
          <Link
            href="/login"
            className="ml-6 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-background text-foreground">
        <div className="w-full max-w-[36rem] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,14,0.72)] p-6 sm:p-8 text-center">
          <p className="text-sm text-[rgba(248,244,238,0.88)]">
            Your password has been updated. Redirecting to sign in…
          </p>
        </div>
      </main>
    );
  }

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
                    Set new password
                  </div>
                  <h1 className="mt-1.5 font-serif text-2xl italic leading-tight text-[rgba(248,244,238,0.9)] sm:text-3xl">
                    Create a new password
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-black/[0.18] focus-within:border-[rgba(214,188,140,0.18)] focus-within:ring-2 focus-within:ring-[rgba(214,188,140,0.06)]">
                    <label className="block px-4 pt-3 pb-1.5 text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full bg-transparent px-4 pb-3 text-sm text-[rgba(248,244,238,0.92)] outline-none placeholder:text-[rgba(240,229,205,0.22)]"
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-black/[0.18] focus-within:border-[rgba(214,188,140,0.18)] focus-within:ring-2 focus-within:ring-[rgba(214,188,140,0.06)]">
                    <label className="block px-4 pt-3 pb-1.5 text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full bg-transparent px-4 pb-3 text-sm text-[rgba(248,244,238,0.92)] outline-none placeholder:text-[rgba(240,229,205,0.22)]"
                      placeholder="Same as above"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(245,240,232,1)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-[rgba(34,28,22,0.94)] shadow-[0_18px_42px_-24px_rgba(255,255,255,0.22)] transition-all hover:translate-y-[-1px] disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        Updating…
                        <span className="h-4 w-4 animate-spin rounded-full border border-[rgba(34,28,22,0.24)] border-t-[rgba(34,28,22,0.88)]" />
                      </>
                    ) : (
                      "Reset password"
                    )}
                  </button>
                </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
