"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

type LearningFeedbackPanelProps = {
  totalActions: number | null | undefined;
  streakDays: number | null | undefined;
};

export function LearningFeedbackPanel({
  totalActions,
  streakDays,
}: LearningFeedbackPanelProps) {
  const top = useQuery(api.userPreferences.getTopLearnedAttribute);
  const actions = totalActions ?? 0;
  const streak = streakDays ?? 0;
  const hasSignal = top && Math.abs(top.weight) > 0;

  return (
    <section
      className="mb-6 border border-border bg-secondary/20 px-4 py-4"
      aria-labelledby="learning-feedback-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            id="learning-feedback-heading"
            className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
          >
            Learning status
          </p>
          <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-foreground">
            OutfAI learns when you save, skip, wear, or view outfit ideas. Those
            signals tune colors, styles, tags, occasions, and garment types.
          </p>
        </div>
        <div className="grid min-w-52 grid-cols-2 gap-3 text-right">
          <div>
            <p className="text-2xl font-light tabular-nums text-foreground">
              {actions}
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              actions
            </p>
          </div>
          <div>
            <p className="text-2xl font-light tabular-nums text-foreground">
              {streak}
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              day streak
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {hasSignal
            ? `Strongest learned signal: ${top.dim} "${top.value}" (${top.weight > 0 ? "liked" : "avoided"}).`
            : actions === 0
              ? "No learning signals yet. Save or skip a look to start training the feed."
              : "Signals are being collected. A stronger taste pattern will appear here after a few more actions."}
        </p>
      </div>
    </section>
  );
}
