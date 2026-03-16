"use client";

import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect } from "react";

/**
 * When authenticated, redirect to /onboarding if the user has not completed onboarding.
 * Allow /onboarding and public routes through without redirect.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const profile = useQuery(api.profile.get);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (pathname === "/onboarding") return;

    // Still loading profile
    if (profile === undefined) return;

    const completed = profile?.onboardingComplete === true;
    if (!completed) {
      router.replace("/onboarding");
    }
  }, [authLoading, isAuthenticated, pathname, profile, router]);

  // While checking or redirecting, avoid flashing the destination page
  if (isAuthenticated && pathname !== "/onboarding" && profile === undefined) {
    return null;
  }
  if (
    isAuthenticated &&
    pathname !== "/onboarding" &&
    profile &&
    profile.onboardingComplete !== true
  ) {
    return null;
  }

  return <>{children}</>;
}
