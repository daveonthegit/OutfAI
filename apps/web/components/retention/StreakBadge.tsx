"use client";

type StreakBadgeProps = {
  streakDays: number | null | undefined;
};

export function StreakBadge({ streakDays }: StreakBadgeProps) {
  const s = streakDays ?? 0;
  if (s <= 0) return null;

  return (
    <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground border border-border px-2 py-1 bg-secondary/30">
      {s}-day streak
    </div>
  );
}
