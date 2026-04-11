"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { AuthEditorialShell } from "@/components/marketing/auth-editorial-shell";
import {
  FormError,
  FormField,
  FormFieldStack,
  FormPanel,
  PrimaryFormButton,
  authInputClassName,
  authPasswordToggleClassName,
} from "@/components/marketing/form-panel";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(false);
    setLoading(true);

    try {
      const { error } = await authClient.signIn.username(
        { username, password },
        {
          onError: (ctx) => {
            if (ctx.error?.status === 403) {
              setUnverifiedEmail(true);
              setError("Please verify your email before signing in.");
            }
          },
        }
      );

      if (error) {
        const isUnverified =
          "status" in error && (error as { status?: number }).status === 403;
        if (isUnverified) {
          setUnverifiedEmail(true);
          setError("Please verify your email before signing in.");
        } else {
          setError("Invalid username or password.");
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    setError("");
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: resendEmail.trim(),
        callbackURL: "/verify-email",
      });
      if (error)
        setError(error.message ?? "Could not send verification email.");
      else setResendSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const lockIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-current"
    >
      <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2Z" />
      <path d="M17 9V7a5 5 0 0 0-10 0v2" />
      <path d="M7 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
    </svg>
  );

  return (
    <AuthEditorialShell
      footerNote="By continuing, you agree to our terms and acknowledge our privacy policy."
      aside={
        <>
          <p className="mb-1 font-sans text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:text-[11px]">
            Session
          </p>
          <h1 className="font-serif text-[clamp(1.35rem,3vw+0.5rem,2.5rem)] font-normal italic leading-[0.95] tracking-[-0.02em] text-foreground">
            Welcome
            <span className="block text-[#ff4d00] dark:text-[#c6a564]">
              back.
            </span>
          </h1>
          <p className="mt-2 line-clamp-3 max-w-[36ch] font-sans text-sm leading-snug text-muted-foreground">
            Resume outfit planning and closet work—same session, no extra steps.
          </p>
        </>
      }
    >
      <FormPanel
        compact
        eyebrow="Sign in"
        title="Enter your credentials"
        description="Username and password from registration."
        icon={lockIcon}
      >
        <form onSubmit={handleSubmit} className="space-y-0">
          <FormFieldStack>
            <FormField label="Username">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className={authInputClassName}
                placeholder="your username"
              />
            </FormField>

            <div className="border-b border-[#0a0a0a]/[0.08] last:border-b-0 dark:border-[#f4f3ef]/[0.1]">
              <label className="block px-4 pt-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:pt-3 sm:text-[11px]">
                Password
              </label>
              <div className="relative px-4 pb-2.5 sm:pb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={`${authInputClassName} pr-14`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={authPasswordToggleClassName}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 5.09A10.9 10.9 0 0 1 12 5c7 0 10 7 10 7a17.6 17.6 0 0 1-4.35 5.17" />
                      <path d="M6.11 6.11A17.6 17.6 0 0 0 2 12s3 7 10 7a10.9 10.9 0 0 0 2.12-.2" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </FormFieldStack>

          {error ? <FormError message={error} /> : null}

          <div className="pt-3 sm:pt-5">
            <PrimaryFormButton disabled={loading}>
              {loading ? (
                <>
                  Signing in
                  <span
                    aria-hidden
                    className="inline-flex h-4 w-4 animate-spin rounded-full border border-[#f4f3ef]/30 border-t-[#f4f3ef] dark:border-[#0a0a0a]/35 dark:border-t-[#0a0a0a]"
                  />
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </PrimaryFormButton>
          </div>
        </form>

        {unverifiedEmail ? (
          <div className="mt-3 border border-[#0a0a0a]/[0.1] bg-white px-3 py-3 dark:border-[#f4f3ef]/[0.12] dark:bg-[#0a0a0a] sm:mt-4 sm:px-4">
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
              Resend verification email
            </p>
            {resendSent ? (
              <p className="mt-3 font-sans text-sm leading-relaxed text-foreground">
                Check your inbox for the verification link.
              </p>
            ) : (
              <form
                onSubmit={handleResendVerification}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="min-w-0 flex-1 border border-[#0a0a0a]/[0.12] bg-[#faf9f7] px-3 py-2 dark:border-[#f4f3ef]/[0.15] dark:bg-[#111111]">
                  <label className="block font-sans text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1 w-full bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="shrink-0 rounded-[var(--marketing-radius-engineered)] border border-[#0a0a0a]/[0.18] bg-transparent px-4 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-foreground transition-colors duration-150 hover:bg-[#0a0a0a]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 dark:border-[#f4f3ef]/25 dark:hover:bg-[#f4f3ef]/[0.06]"
                >
                  {resendLoading ? "Sending" : "Resend"}
                </button>
              </form>
            )}
          </div>
        ) : null}

        <div className="mt-4 text-center sm:mt-5">
          <Link
            href="/forgot-password"
            className="rounded-sm font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-150 hover:text-[#ff4d00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:text-[#c6a564] sm:text-sm"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3 sm:mt-5">
          <div className="h-px flex-1 bg-[#0a0a0a]/[0.1] dark:bg-[#f4f3ef]/[0.12]" />
          <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-[#0a0a0a]/[0.1] dark:bg-[#f4f3ef]/[0.12]" />
        </div>

        <div className="mt-3 text-center font-sans text-sm text-muted-foreground sm:mt-4">
          No account?{" "}
          <Link
            href="/signup"
            className="text-foreground underline underline-offset-[6px] transition-colors duration-150 hover:text-[#ff4d00] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:text-[#c6a564]"
          >
            Create one
          </Link>
        </div>
      </FormPanel>
    </AuthEditorialShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-[100dvh] max-h-[100dvh] items-center justify-center overflow-hidden bg-background">
          <div
            className="h-px w-16 animate-pulse bg-foreground/20 dark:bg-foreground/25"
            aria-hidden
          />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
