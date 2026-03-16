"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Mood is now selected via a modal on the home page.
 * This route redirects to home with the mood modal open.
 */
export default function MoodPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?openMood=1");
  }, [router]);

  return null;
}
