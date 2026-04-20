"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void): () => void {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Matches when `window.matchMedia(query)` is true (SSR-safe, default false).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getSnapshot(query),
    getServerSnapshot
  );
}

/** Tailwind `md` breakpoint — min-width 768px */
export function useIsMdUp(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
