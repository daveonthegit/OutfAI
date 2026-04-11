"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import {
  AuthStandaloneLayout,
  authStandaloneCardClass,
  authStandalonePrimaryButtonClass,
} from "@/components/marketing/auth-standalone-layout";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  return (
    <AuthStandaloneLayout maxWidthClass="max-w-xl md:max-w-2xl">
      <div
        className={cn(
          authStandaloneCardClass,
          "p-8 text-center sm:p-10 md:p-12 lg:p-14"
        )}
      >
        <div
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground sm:h-20 sm:w-20"
          aria-hidden
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="sm:h-9 sm:w-9"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl italic leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Check your email
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          We sent a verification link to{" "}
          <strong className="font-medium text-foreground">{email}</strong>.
          Click the link to verify your account and sign in.
        </p>

        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          Didn&apos;t get the email? Check spam or{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--signal-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            sign in
          </Link>{" "}
          to request a new link.
        </p>

        <Link
          href="/login"
          className={cn(
            authStandalonePrimaryButtonClass,
            "mx-auto mt-10 w-full max-w-xs sm:max-w-sm"
          )}
        >
          Back to sign in
        </Link>
      </div>
    </AuthStandaloneLayout>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center gap-3">
            <span
              className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground motion-reduce:animate-none"
              aria-hidden
            />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </div>
        </main>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
