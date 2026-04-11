"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AuthStandaloneLayout,
  authStandaloneCardClass,
  authStandalonePrimaryButtonClass,
} from "@/components/marketing/auth-standalone-layout";

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg";

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
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground motion-reduce:animate-none"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        </div>
      </main>
    );
  }

  return (
    <AuthStandaloneLayout>
      <div className={cn(authStandaloneCardClass, "text-center")}>
        {status === "success" ? (
          <>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted/30">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-foreground"
                aria-hidden
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl italic tracking-tight text-foreground">
              Email verified
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your email is verified. You can sign in now.
            </p>
            <Link
              href="/"
              className={cn(
                authStandalonePrimaryButtonClass,
                "mx-auto mt-8 inline-flex w-full max-w-xs sm:max-w-sm"
              )}
            >
              Continue to OutfAI
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl italic tracking-tight text-foreground">
              Verification failed
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              The link may have expired or already been used. Request a new
              verification email from the sign-in page.
            </p>
            <Link
              href="/login"
              className={cn(
                "mx-auto mt-8 inline-flex w-full max-w-xs items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-muted/50 sm:max-w-sm",
                linkFocus
              )}
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </AuthStandaloneLayout>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
