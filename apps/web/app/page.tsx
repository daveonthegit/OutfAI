"use client";

import { useConvexAuth } from "convex/react";
import AuthenticatedHome from "@/components/home/authenticated-home";
import { PublicLanding } from "@/components/marketing/public-landing";

function LandingLoadingState() {
  return (
    <main className="flex h-[100dvh] max-h-[100dvh] items-center justify-center overflow-hidden bg-[#f4f3ef] dark:bg-[var(--marketing-void)]">
      <div className="flex flex-col items-center gap-4">
        <span className="font-serif text-xl italic tracking-tight text-[#0a0a0a] dark:text-[#f4f3ef]">
          OutfAI
        </span>
        <div
          className="h-px w-16 animate-pulse bg-[#0a0a0a]/20 dark:bg-[#f4f3ef]/25"
          role="status"
          aria-live="polite"
        />
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-[#7a7a7a] dark:text-[#9a9a9a]">
          Loading
        </span>
      </div>
    </main>
  );
}

export default function HomePage() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <LandingLoadingState />;
  }

  if (isAuthenticated) {
    return <AuthenticatedHome />;
  }

  return <PublicLanding />;
}
