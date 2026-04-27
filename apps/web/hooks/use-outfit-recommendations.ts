import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Mood, WeatherCondition, Outfit } from "@shared/types";

/**
 * Outfit recommendations via Convex `api.recommendationRank.getRankedRecommendations`.
 * Call `generate()` to load; user preferences are applied server-side from Convex `userPreferences`.
 */

interface UseOutfitRecommendationsOptions {
  userId: string;
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  occasion?: string;
  limitCount?: number;
}

type ActiveRequest = {
  mood?: string;
  weather?: string;
  temperature?: number;
  occasion?: string;
  limit: number;
  garmentIds?: string[];
  nonce: number;
};

interface UseOutfitRecommendationsReturn {
  outfits: Outfit[];
  loading: boolean;
  error: string | null;
  explanation: string;
  generate: (
    options?: Partial<UseOutfitRecommendationsOptions> & {
      garmentIds?: string[];
    }
  ) => Promise<void>;
  reset: () => void;
}

type RankOutfitRow = {
  garmentIds: string[];
  explanation: string;
  score: number;
  baseScore: number;
  personalScore: number;
  scoreBreakdown?: Outfit["scoreBreakdown"];
};

function mapRankedToOutfits(
  rows: RankOutfitRow[],
  userId: string,
  context: { mood?: Mood; weather?: WeatherCondition },
  nonce: number
): Outfit[] {
  if (!rows.length) return [];
  return rows.map((r, i) => {
    const scorePct = Math.min(
      100,
      Math.max(
        0,
        Math.round((r.baseScore * 0.45 + (r.personalScore + 0.5) * 0.55) * 100)
      )
    );
    return {
      id: `rec-${nonce}-${i}`,
      userId,
      garmentIds: r.garmentIds,
      explanation: r.explanation,
      score: scorePct,
      scoreBreakdown: r.scoreBreakdown,
      contextMood: context.mood,
      contextWeather: context.weather,
      createdAt: new Date(),
    };
  });
}

export function useOutfitRecommendations(
  initialOptions: UseOutfitRecommendationsOptions
): UseOutfitRecommendationsReturn {
  const [active, setActive] = useState<ActiveRequest | null>(null);
  const stableOutfitsRef = useRef<Outfit[]>([]);
  const [narratives, setNarratives] = useState<{
    nonce: number;
    byId: Map<string, string>;
    overall?: string;
  } | null>(null);

  const ranked = useQuery(
    api.recommendationRank.getRankedRecommendations,
    active === null
      ? "skip"
      : {
          mood: active.mood,
          weather: active.weather,
          temperature: active.temperature,
          occasion: active.occasion,
          limit: active.limit,
          garmentIds: active.garmentIds,
          nonce: active.nonce,
        }
  );

  const loading = active !== null && ranked === undefined;

  const baseOutfits = useMemo(() => {
    if (active === null) {
      stableOutfitsRef.current = [];
      return [];
    }
    if (ranked === undefined) {
      return stableOutfitsRef.current;
    }
    if (!ranked.outfits.length) {
      stableOutfitsRef.current = [];
      return [];
    }
    const contextMood = (active.mood ?? initialOptions.mood) as
      | Mood
      | undefined;
    const contextWeather = (active.weather ?? initialOptions.weather) as
      | WeatherCondition
      | undefined;
    const next = mapRankedToOutfits(
      ranked.outfits as RankOutfitRow[],
      initialOptions.userId,
      { mood: contextMood, weather: contextWeather },
      active.nonce
    );
    stableOutfitsRef.current = next;
    return next;
  }, [
    active,
    ranked,
    initialOptions.userId,
    initialOptions.mood,
    initialOptions.weather,
  ]);

  // Fire-and-merge: ask Gemini to rewrite explanations once a fresh rank arrives.
  // Server returns originals (no-op) when GEMINI_NARRATIVE_ENABLED is not set.
  useEffect(() => {
    if (active === null || baseOutfits.length === 0) return;
    if (narratives && narratives.nonce === active.nonce) return;

    const nonce = active.nonce;
    const controller = new AbortController();

    const run = async () => {
      try {
        const res = await fetch("/api/outfit-narratives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            context: {
              mood: active.mood ?? null,
              weather: active.weather ?? null,
              temperature: active.temperature ?? null,
              occasion: active.occasion ?? null,
            },
            outfits: baseOutfits.map((o) => ({
              outfitId: o.id,
              garmentIds: o.garmentIds,
              currentExplanation: o.explanation,
              score: o.score,
            })),
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          enhanced?: boolean;
          overallExplanation?: string;
          outfitNarratives?: Array<{ outfitId: string; explanation: string }>;
        };
        if (!data.enhanced || !Array.isArray(data.outfitNarratives)) return;
        const byId = new Map(
          data.outfitNarratives
            .filter((n) => n?.outfitId && n?.explanation)
            .map((n) => [n.outfitId, n.explanation])
        );
        if (byId.size === 0) return;
        setNarratives({ nonce, byId, overall: data.overallExplanation });
      } catch {
        // best-effort enhancer
      }
    };

    void run();
    return () => controller.abort();
  }, [active, baseOutfits, narratives]);

  const outfits = useMemo(() => {
    if (
      !narratives ||
      active === null ||
      narratives.nonce !== active.nonce ||
      narratives.byId.size === 0
    ) {
      return baseOutfits;
    }
    return baseOutfits.map((o) => {
      const rewritten = narratives.byId.get(o.id);
      return rewritten ? { ...o, explanation: rewritten } : o;
    });
  }, [baseOutfits, narratives, active]);

  const explanation = useMemo(() => {
    if (
      narratives &&
      active !== null &&
      narratives.nonce === active.nonce &&
      narratives.overall
    ) {
      return narratives.overall;
    }
    if (!outfits.length) return "";
    return outfits[0]?.explanation ?? "";
  }, [outfits, narratives, active]);

  const generate = useCallback(
    async (
      overrides: Partial<UseOutfitRecommendationsOptions> & {
        garmentIds?: string[];
      } = {}
    ) => {
      const o = { ...initialOptions, ...overrides };
      setActive({
        mood: o.mood,
        weather: o.weather,
        temperature: o.temperature,
        occasion: o.occasion,
        limit: o.limitCount ?? 8,
        garmentIds: overrides.garmentIds,
        nonce: Date.now(),
      });
    },
    [initialOptions]
  );

  const reset = useCallback(() => {
    setActive(null);
    stableOutfitsRef.current = [];
    setNarratives(null);
  }, []);

  return {
    outfits,
    loading,
    error: null,
    explanation,
    generate,
    reset,
  };
}
