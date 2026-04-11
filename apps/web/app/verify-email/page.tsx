"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    token ? "pending" : "success"
  );

  useEffect(() => {
    if (!token) {
      setStatus("success");
      return;
    }
    void authClient
      .verifyEmail({ query: { token } })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Verifying your email…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-foreground/6 blur-3xl" />
        <div className="absolute top-40 -right-28 h-96 w-96 rounded-full bg-foreground/4 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border/70 bg-background/55 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] p-8">
            {status === "success" ? (
              <>
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border/70 bg-foreground/5">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-foreground/80"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h1 className="font-serif italic text-2xl text-foreground tracking-tight">
                  Email verified
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your email is verified. You can sign in now.
                </p>
                <Link
                  href="/"
                  className="mt-8 inline-block rounded-xl bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90"
                >
                  Continue to OutfAI
                </Link>
              </>
            ) : (
              <>
                <h1 className="font-serif italic text-2xl text-foreground tracking-tight">
                  Verification failed
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  The link may have expired or already been used. Request a new
                  verification email from the sign-in page.
                </p>
                <Link
                  href="/login"
                  className="mt-8 inline-block rounded-xl border border-border/70 bg-background/60 px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground"
                >
                  Back to sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <span className="h-6 w-6 animate-spin rounded-full border border-foreground/30 border-t-foreground" />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
