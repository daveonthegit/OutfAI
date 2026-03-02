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
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center px-4 md:px-8 lg:px-12">
      {/* Logo */}
      <div className="mb-16">
        <Link
          href="/"
          className="text-base tracking-tight font-medium hover:text-signal-orange transition-colors duration-100"
        >
          OutfAI
        </Link>
      </div>

      <div className="max-w-sm w-full">
        {/* Heading */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl italic text-foreground leading-[0.95] tracking-tight mb-3">
            create your
          </h1>
          <h1 className="font-serif text-4xl sm:text-5xl italic text-muted-foreground leading-[0.95] tracking-tight">
            wardrobe.
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="border border-border">
            <div className="border-b border-border">
              <label className="block px-4 pt-3 pb-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
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
            <div className="border-b border-border">
              <label className="block px-4 pt-3 pb-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
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
            <div>
              <label className="block px-4 pt-3 pb-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 pb-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="pt-3 text-[11px] uppercase tracking-[0.15em] text-signal-orange">
              {error}
            </p>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 text-[10px] uppercase tracking-[0.2em] bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 transition-all duration-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Creating account…"
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
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
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
            className="text-[11px] text-foreground underline underline-offset-2 hover:text-signal-orange transition-colors duration-100"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
