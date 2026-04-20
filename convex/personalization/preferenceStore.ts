import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { PreferenceSignal } from "./signals";
import { clampWeight } from "./scoring";
import { applyDecay } from "./decay";
import { DECAY_FACTOR } from "./constants";

type Learned = NonNullable<Doc<"userPreferences">["learnedWeights"]>;

function mergeSignals(
  current: Learned | undefined,
  signals: PreferenceSignal[]
): Learned {
  const next: Learned = current
    ? {
        color: current.color ? { ...current.color } : undefined,
        style: current.style ? { ...current.style } : undefined,
        tag: current.tag ? { ...current.tag } : undefined,
        occasion: current.occasion ? { ...current.occasion } : undefined,
        category: current.category ? { ...current.category } : undefined,
      }
    : {};

  for (const s of signals) {
    const dim = s.dim;
    const map = { ...(next[dim] ?? {}) };
    const prev = map[s.value] ?? 0;
    map[s.value] = clampWeight(prev + s.delta);
    next[dim] = map;
  }

  return next;
}

function utcDateString(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function nextStreak(
  stats: Doc<"userPreferences">["stats"] | undefined,
  today: string
): { streakDays: number; lastActionDate: string } {
  const prevDate = stats?.lastActionDate;
  const prevStreak = stats?.streakDays ?? 0;

  if (!prevDate) {
    return { streakDays: 1, lastActionDate: today };
  }
  if (prevDate === today) {
    return { streakDays: Math.max(1, prevStreak), lastActionDate: today };
  }

  const dayMs = 86_400_000;
  const prevTs = new Date(`${prevDate}T12:00:00.000Z`).getTime();
  const curTs = new Date(`${today}T12:00:00.000Z`).getTime();
  const diffDays = Math.round((curTs - prevTs) / dayMs);

  if (diffDays === 1) {
    return { streakDays: Math.max(1, prevStreak) + 1, lastActionDate: today };
  }
  return { streakDays: 1, lastActionDate: today };
}

/**
 * Merge preference signals into the user's learnedWeights (auto-upsert row).
 */
export async function applySignalsToLearnedWeights(
  ctx: MutationCtx,
  userId: string,
  signals: PreferenceSignal[]
): Promise<void> {
  const existing = await ctx.db
    .query("userPreferences")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  const merged = mergeSignals(existing?.learnedWeights, signals);

  if (existing) {
    await ctx.db.patch(existing._id, {
      learnedWeights: merged,
    });
    return;
  }

  await ctx.db.insert("userPreferences", {
    userId,
    learnedWeights: merged,
  });
}

/**
 * Increment action counters and streak for save / skip / worn.
 */
export async function bumpStatsForAction(
  ctx: MutationCtx,
  userId: string,
  action: string
): Promise<void> {
  const existing = await ctx.db
    .query("userPreferences")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  const now = Date.now();
  const today = utcDateString(now);
  const prev = existing?.stats;

  const totalActions = (prev?.totalActions ?? 0) + 1;
  const savedCount = (prev?.savedCount ?? 0) + (action === "saved" ? 1 : 0);
  const skippedCount =
    (prev?.skippedCount ?? 0) + (action === "skipped" ? 1 : 0);
  const wornCount = (prev?.wornCount ?? 0) + (action === "worn" ? 1 : 0);

  const { streakDays, lastActionDate } = nextStreak(prev, today);

  const nextStats = {
    ...prev,
    totalActions,
    savedCount,
    skippedCount,
    wornCount,
    lastUpdated: now,
    streakDays,
    lastActionDate,
  };

  if (existing) {
    await ctx.db.patch(existing._id, { stats: nextStats });
    return;
  }

  await ctx.db.insert("userPreferences", {
    userId,
    stats: nextStats,
  });
}

/**
 * Daily decay job: apply multiplicative decay to all users' learned weights.
 */
export async function decayAllUserWeights(ctx: MutationCtx): Promise<number> {
  const rows = await ctx.db.query("userPreferences").collect();
  let n = 0;
  for (const row of rows) {
    if (!row.learnedWeights) continue;
    const next = applyDecay(row.learnedWeights, DECAY_FACTOR);
    await ctx.db.patch(row._id, {
      learnedWeights: next,
      stats: {
        ...row.stats,
        lastUpdated: Date.now(),
      },
    });
    n++;
  }
  return n;
}
