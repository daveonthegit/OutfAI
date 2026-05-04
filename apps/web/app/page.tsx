"use client";

import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import AuthenticatedHome from "@/components/home/authenticated-home";
import { PublicLanding } from "@/components/marketing/public-landing";

export default function HomePage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [stableAuthState, setStableAuthState] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setStableAuthState(isAuthenticated);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading && stableAuthState === null) {
    return null;
  }

  if (stableAuthState ?? isAuthenticated) {
    return <AuthenticatedHome />;
  }

  return <PublicLanding />;
}
