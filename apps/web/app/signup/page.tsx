"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: username,
        username,
      });

      if (error) {
        setError(
          error.message ??
            "Could not create account. Try a different username or email."
        );
      } else {
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const userIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-current"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  return (
    <AuthEditorialShell
      footerNote="By continuing, you agree to our terms and acknowledge our privacy policy."
      aside={
        <>
          <p className="mb-1 font-sans text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:text-[11px]">
            Onboarding
          </p>
          <h1 className="font-serif text-[clamp(1.35rem,3vw+0.5rem,2.5rem)] font-normal italic leading-[0.95] tracking-[-0.02em] text-foreground">
            Claim your
            <span className="block text-[#ff4d00] dark:text-[#c6a564]">
              closet workspace.
            </span>
          </h1>
          <p className="mt-2 line-clamp-3 max-w-[38ch] font-sans text-sm leading-snug text-muted-foreground">
            Register in a minute, then catalog pieces and assemble looks with
            intent.
          </p>
        </>
      }
    >
      <FormPanel
        compact
        eyebrow="Create account"
        title="Choose your access"
        description="Username, email, and a strong password."
        icon={userIcon}
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
                placeholder="choose a username"
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className={authInputClassName}
                placeholder="you@example.com"
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
                  autoComplete="new-password"
                  required
                  className={`${authInputClassName} pr-14`}
                  placeholder="At least 8 characters"
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
                  Creating account
                  <span
                    aria-hidden
                    className="inline-flex h-4 w-4 animate-spin rounded-full border border-[#f4f3ef]/30 border-t-[#f4f3ef] dark:border-[#0a0a0a]/35 dark:border-t-[#0a0a0a]"
                  />
                </>
              ) : (
                <>
                  Create account
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

        <div className="mt-3 text-center font-sans text-sm text-muted-foreground sm:mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-[6px] transition-colors duration-150 hover:text-[#ff4d00] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:text-[#c6a564]"
          >
            Sign in
          </Link>
        </div>
      </FormPanel>
    </AuthEditorialShell>
  );
}
