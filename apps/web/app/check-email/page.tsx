"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-foreground/6 blur-3xl" />
        <div className="absolute top-40 -right-28 h-96 w-96 rounded-full bg-foreground/4 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_18%_18%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_85%_35%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] opacity-[0.10]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border/70 bg-background/55 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] p-8">
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl italic text-foreground tracking-tight">
              Check your email
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a verification link to <strong>{email}</strong>. Click the
              link to verify your account and sign in.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Didn&apos;t get the email? Check spam or{" "}
              <Link
                href="/login"
                className="text-foreground underline underline-offset-4 hover:text-signal-orange"
              >
                sign in
              </Link>{" "}
              to request a new link.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-xl border border-border/70 bg-background/60 px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-background/80"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <span className="h-6 w-6 animate-spin rounded-full border border-foreground/30 border-t-foreground" />
        </main>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
