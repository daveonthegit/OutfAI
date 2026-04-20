"use client";

import Link from "next/link";

type HomeFooterActionsProps = {
  hasRecommendations: boolean;
  isSelectMode: boolean;
  savedOutfitId: string | null;
  onToggleSelectMode: () => void;
  onShuffle: () => void;
  shuffleDisabled: boolean;
};

export function HomeFooterActions({
  hasRecommendations,
  isSelectMode,
  savedOutfitId,
  onToggleSelectMode,
  onShuffle,
  shuffleDisabled,
}: HomeFooterActionsProps) {
  return (
    <>
      <section className="flex items-center justify-center gap-8 md:gap-12 mb-20 md:mb-28">
        {hasRecommendations && (
          <>
            <button
              type="button"
              onClick={onToggleSelectMode}
              className={`text-[11px] uppercase tracking-[0.25em] transition-colors duration-100 group flex items-center gap-2 cursor-pointer ${
                isSelectMode
                  ? "text-foreground border-border"
                  : savedOutfitId
                    ? "text-muted-foreground"
                    : "text-foreground hover:text-signal-orange"
              }`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isSelectMode ? "Cancel" : savedOutfitId ? "Saved!" : "Save Look"}
            </button>

            <div className="w-px h-4 bg-border" />
          </>
        )}

        <button
          type="button"
          onClick={onShuffle}
          disabled={shuffleDisabled}
          className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors duration-100 group flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="shrink-0"
          >
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          Shuffle
        </button>
      </section>

      <section className="border-t border-border pt-10 md:pt-14">
        <Link
          href="/explain"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 group"
        >
          Why this works
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="shrink-0"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </section>
    </>
  );
}
