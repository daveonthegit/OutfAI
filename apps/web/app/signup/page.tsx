"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-foreground/6 blur-3xl" />
        <div className="absolute top-40 -right-28 h-96 w-96 rounded-full bg-foreground/4 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_18%_18%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_85%_35%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] opacity-[0.10]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 md:px-8 lg:px-12">
        <div className="w-full">
          {/* Top bar */}
          <div className="mb-12 flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm tracking-tight font-medium text-foreground/90 hover:text-foreground transition-colors duration-150"
            >
              <span className="relative">
                OutfAI
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground/60 transition-all duration-200 group-hover:w-full" />
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                Quick setup
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
                Secure by default
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: headline */}
            <div className="lg:col-span-6">
              <div className="max-w-xl">
                <div className="mb-10">
                  <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl italic text-foreground leading-[0.9] tracking-tight">
                    Create your
                  </h1>
                  <h1 className="mt-2 font-serif text-5xl sm:text-6xl lg:text-7xl italic text-muted-foreground leading-[0.9] tracking-tight">
                    wardrobe today!
                  </h1>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                  Set up your account in a minute, and then start building right
                  away.
                </p>

                <div className="mt-10 hidden lg:flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1.5 backdrop-blur">
                    Personal
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1.5 backdrop-blur">
                    Private
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1.5 backdrop-blur">
                    Minimal
                  </span>
                </div>
              </div>
            </div>

            {/* Right: form card */}
            <div className="lg:col-span-6">
              <div className="max-w-md">
                <div className="relative rounded-2xl border border-border/70 bg-background/55 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]">
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(600px_circle_at_30%_0%,rgba(255,255,255,0.08),transparent_50%)]" />
                  <div className="relative p-6 sm:p-7">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Create account
                        </div>
                        <div className="mt-2 text-sm text-foreground/80">
                          Choose a username, email, and password.
                        </div>
                      </div>
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/50">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-foreground/70"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-0">
                      <div className="rounded-xl border border-border/70 overflow-hidden bg-background/40 focus-within:ring-2 focus-within:ring-foreground/20 focus-within:border-foreground/30">
                        <div className="border-b border-border/70">
                          <label className="block px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            Username
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                            className="w-full px-4 pb-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40"
                            placeholder="choose a username"
                          />
                        </div>

                        <div className="border-b border-border/70">
                          <label className="block px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="w-full px-4 pb-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40"
                            placeholder="you@example.com"
                          />
                        </div>

                        <div className="relative">
                          <label className="block px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            Password
                          </label>

                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            className="w-full pr-14 px-4 pb-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40"
                            placeholder="••••••••"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-[20px] inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/30 text-muted-foreground hover:text-foreground hover:bg-background/50 active:scale-[0.98] transition-colors"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <svg
                                width="16"
                                height="16"
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
                                width="16"
                                height="16"
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

                      {error && (
                        <div className="pt-4">
                          <p className="rounded-lg border border-signal-orange/30 bg-signal-orange/10 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-signal-orange">
                            {error}
                          </p>
                        </div>
                      )}

                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={loading}
                          className="group relative w-full overflow-hidden rounded-xl px-6 py-4 text-[10px] uppercase tracking-[0.22em] bg-foreground text-background disabled:opacity-40 transition-all duration-150 flex items-center justify-center gap-2 hover:shadow-[0_10px_25px_-15px_rgba(255,255,255,0.35)]"
                        >
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[radial-gradient(400px_circle_at_50%_0%,rgba(255,255,255,0.25),transparent_60%)]"
                          />
                          <span className="relative inline-flex items-center gap-2">
                            {loading ? (
                              <>
                                Creating account…
                                <span
                                  aria-hidden="true"
                                  className="ml-1 inline-flex h-4 w-4 items-center justify-center"
                                >
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border border-background/60 border-t-background" />
                                </span>
                              </>
                            ) : (
                              <>
                                Create account
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                                >
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                  <polyline points="12 5 19 12 12 19" />
                                </svg>
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                      <span className="text-[11px] text-muted-foreground">
                        Already have an account?{" "}
                      </span>
                      <Link
                        href="/login"
                        className="text-[11px] text-foreground underline underline-offset-4 hover:text-signal-orange transition-colors duration-150"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-[11px] text-muted-foreground/80 leading-relaxed">
                  By continuing, you agree to our terms and acknowledge our
                  privacy policy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
