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
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Editorial noir background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />

        <div className="absolute left-[2%] top-[31%] h-[20rem] w-[20rem] rounded-full bg-white/[0.045] blur-[95px] sm:h-[24rem] sm:w-[24rem] xl:h-[28rem] xl:w-[28rem]" />
        <div className="absolute left-[5%] top-[39%] h-[14rem] w-[14rem] rounded-full bg-[rgba(214,188,140,0.05)] blur-[90px] sm:h-[18rem] sm:w-[18rem]" />

        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:38px_38px] sm:[background-size:46px_46px] xl:[background-size:56px_56px] 2xl:[background-size:64px_64px] opacity-[0.04]" />

        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent opacity-40" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_24%,rgba(0,0,0,0.28)_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='white'%3E%3Ccircle cx='10' cy='14' r='1'/%3E%3Ccircle cx='46' cy='28' r='1'/%3E%3Ccircle cx='92' cy='18' r='1'/%3E%3Ccircle cx='130' cy='48' r='1'/%3E%3Ccircle cx='32' cy='82' r='1'/%3E%3Ccircle cx='76' cy='70' r='1'/%3E%3Ccircle cx='118' cy='94' r='1'/%3E%3Ccircle cx='20' cy='126' r='1'/%3E%3Ccircle cx='68' cy='138' r='1'/%3E%3Ccircle cx='142' cy='132' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto min-h-screen w-full px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10 lg:py-8 xl:px-12 xl:py-9 2xl:px-16 2xl:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[min(96vw,3200px)] flex-col justify-start sm:min-h-[calc(100vh-2.5rem)] md:min-h-[calc(100vh-3rem)]">
          {/* Top bar */}
          <div className="mb-8 flex items-center justify-between sm:mb-10 lg:mb-12 xl:mb-14 2xl:mb-16">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-[clamp(1.08rem,1.35vw,1.78rem)] font-medium uppercase tracking-[0.34em] text-[rgba(245,242,236,0.96)] transition-colors duration-150 hover:text-white"
            >
              <span className="relative">
                OutfAI
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[rgba(214,188,140,0.72)] transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>

            <div className="hidden items-center gap-3 text-[clamp(1.3rem,1.65vw,2.18rem)] md:flex xl:gap-4 2xl:gap-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-4.5 py-2.5 text-[rgba(241,235,226,0.86)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md xl:px-5 xl:py-3">
                <span className="h-2 w-2 rounded-full bg-[rgba(214,188,140,0.78)]" />
                Quick setup
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-white/[0.015] px-4.5 py-2.5 text-[rgba(241,235,226,0.58)] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-md xl:px-5 xl:py-3">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                Secure by default
              </span>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.95fr)] lg:gap-[clamp(2rem,5vw,5rem)] xl:grid-cols-[minmax(0,1.2fr)_minmax(520px,1fr)] 2xl:grid-cols-[minmax(0,1.25fr)_minmax(620px,1fr)]">
            {/* Left */}
            <div className="order-1 self-center lg:self-center">
              <div className="relative w-full max-w-[min(46rem,100%)] xl:max-w-[min(58rem,100%)] 2xl:max-w-[min(70rem,100%)]">
                <div
                  aria-hidden="true"
                  className="absolute -left-6 top-16 h-[18rem] w-[18rem] rounded-full border border-white/[0.035] opacity-70"
                />

                <div className="relative mb-6 sm:mb-7 lg:mb-9 2xl:mb-11">
                  <div className="mb-5 inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-4 py-2.5 text-[clamp(1.04rem,1.18vw,1.52rem)] uppercase tracking-[0.24em] text-[rgba(224,211,188,0.84)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md">
                    Happy to have you here
                  </div>

                  <h1 className="font-serif text-[clamp(3.25rem,8vw,8.5rem)] italic leading-[0.84] tracking-[-0.03em] text-[rgba(249,244,237,0.98)] [text-shadow:0_0_22px_rgba(255,255,255,0.04)]">
                    Create your
                  </h1>
                  <h1 className="mt-1 font-serif text-[clamp(3.25rem,8vw,8.5rem)] italic leading-[0.84] tracking-[-0.03em] text-[rgba(204,184,149,0.74)] sm:mt-2">
                    wardrobe today!
                  </h1>
                </div>

                <p className="max-w-[24rem] text-[clamp(1.5rem,2.15vw,3rem)] leading-relaxed text-[rgba(240,235,228,0.78)] sm:max-w-[30rem] lg:max-w-[36rem] xl:max-w-[42rem] 2xl:max-w-[48rem]">
                  Set up your account in a minute, and then start building right
                  away.
                </p>

                <div className="mt-9 hidden items-center gap-3 text-[clamp(1.24rem,1.34vw,1.82rem)] lg:flex xl:mt-11 2xl:mt-12">
                  <span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-4 py-2.5 text-[rgba(242,236,227,0.84)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md">
                    Personal
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.06)] bg-white/[0.015] px-4 py-2.5 text-[rgba(242,236,227,0.7)] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-md">
                    Private
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.05)] bg-white/[0.01] px-4 py-2.5 text-[rgba(242,236,227,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md">
                    Minimal
                  </span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="order-2 flex w-full justify-start self-center lg:justify-center lg:self-center">
              <div className="relative w-full max-w-[36rem] xl:max-w-[44rem] 2xl:max-w-[52rem]">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[10%] top-[10%] h-[70%] rounded-full bg-white/[0.025] blur-[80px]"
                />

                <div className="relative overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,14,0.72)] shadow-[0_24px_70px_-34px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
                  <div className="absolute inset-0 rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.015))]" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
                  <div className="absolute inset-0 rounded-[1.6rem] ring-1 ring-white/[0.03]" />
                  <div className="absolute inset-0 rounded-[1.6rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-18px_40px_rgba(0,0,0,0.18)]" />

                  <div className="relative p-7 sm:p-8 lg:p-9 xl:p-11 2xl:p-14">
                    <div className="mb-7 flex items-center justify-between sm:mb-8">
                      <div>
                        <div className="text-[clamp(1rem,1vw,1.34rem)] uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                          Create account
                        </div>
                        <div className="mt-3 text-[clamp(1.56rem,1.72vw,2.24rem)] text-[rgba(248,244,238,0.9)]">
                          Choose a username, email, and password.
                        </div>
                      </div>

                      <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-white/[0.015] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:flex xl:h-12 xl:w-12 2xl:h-14 2xl:w-14">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-[rgba(241,235,226,0.66)]"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-0">
                      <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-black/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] focus-within:border-[rgba(214,188,140,0.18)] focus-within:ring-2 focus-within:ring-[rgba(214,188,140,0.06)]">
                        <div className="border-b border-[rgba(255,255,255,0.06)]">
                          <label className="block px-5 pt-4 pb-2 text-[clamp(0.98rem,0.96vw,1.28rem)] uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                            Username
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                            className="w-full bg-transparent px-5 pb-5 text-[clamp(1.5rem,1.58vw,2.1rem)] text-[rgba(248,244,238,0.92)] outline-none placeholder:text-[rgba(240,229,205,0.22)]"
                            placeholder="choose a username"
                          />
                        </div>

                        <div className="border-b border-[rgba(255,255,255,0.06)]">
                          <label className="block px-5 pt-4 pb-2 text-[clamp(0.98rem,0.96vw,1.28rem)] uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="w-full bg-transparent px-5 pb-5 text-[clamp(1.5rem,1.58vw,2.1rem)] text-[rgba(248,244,238,0.92)] outline-none placeholder:text-[rgba(240,229,205,0.22)]"
                            placeholder="you@example.com"
                          />
                        </div>

                        <div className="relative">
                          <label className="block px-5 pt-4 pb-2 text-[clamp(0.98rem,0.96vw,1.28rem)] uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                            Password
                          </label>

                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            className="w-full bg-transparent px-5 pb-5 pr-16 text-[clamp(1.5rem,1.58vw,2.1rem)] text-[rgba(248,244,238,0.92)] outline-none placeholder:text-[rgba(240,229,205,0.22)]"
                            placeholder="••••••••"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-md border border-[rgba(255,255,255,0.07)] bg-white/[0.015] text-[rgba(241,235,226,0.54)] transition-all duration-200 hover:bg-white/[0.035] hover:text-[rgba(250,246,239,0.92)] active:scale-[0.98]"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
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

                      {error && (
                        <div className="pt-6">
                          <p className="rounded-lg border border-signal-orange/30 bg-signal-orange/10 px-4 py-3 text-[clamp(1.08rem,1.1vw,1.42rem)] uppercase tracking-[0.15em] text-signal-orange">
                            {error}
                          </p>
                        </div>
                      )}

                      <div className="pt-8">
                        <button
                          type="submit"
                          disabled={loading}
                          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[rgba(245,240,232,1)] px-6 py-5 text-[clamp(1.08rem,1.08vw,1.38rem)] uppercase tracking-[0.22em] text-[rgba(34,28,22,0.94)] shadow-[0_18px_42px_-24px_rgba(255,255,255,0.22)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_52px_-22px_rgba(255,255,255,0.26)] disabled:opacity-40"
                        >
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-white/[0.14]"
                          />
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-px bg-white/70"
                          />
                          <span className="relative inline-flex items-center gap-2">
                            {loading ? (
                              <>
                                Creating account…
                                <span
                                  aria-hidden="true"
                                  className="ml-1 inline-flex h-5 w-5 items-center justify-center"
                                >
                                  <span className="h-4 w-4 animate-spin rounded-full border border-[rgba(34,28,22,0.24)] border-t-[rgba(34,28,22,0.88)]" />
                                </span>
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

                    <div className="mt-8 text-center">
                      <span className="text-[clamp(1.22rem,1.18vw,1.62rem)] text-[rgba(242,236,227,0.54)]">
                        Already have an account?{" "}
                      </span>
                      <Link
                        href="/login"
                        className="text-[clamp(1.22rem,1.18vw,1.62rem)] text-[rgba(248,244,238,0.92)] underline underline-offset-4 transition-colors duration-150 hover:text-[rgba(214,188,140,0.96)]"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-8 max-w-xl text-[clamp(1.08rem,1.04vw,1.38rem)] leading-relaxed text-[rgba(238,230,216,0.38)] xl:max-w-none">
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
