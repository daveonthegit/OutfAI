"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Garment,
  StyleInsight,
  StyleInsightsOutput,
  Mood,
  WeatherCondition,
} from "@shared/types";

interface UseStyleInsightsOptions {
  garments: Garment[];
  outfitGarmentIds?: string[];
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  /** Optional occasion (e.g. "work", "weekend"); can be derived from mood */
  occasion?: string;
  /** Only fetch when true (e.g. after outfit results exist) */
  enabled?: boolean;
}

interface UseStyleInsightsReturn {
  gaps: StyleInsight[];
  completeTheLook: StyleInsight[];
  styleTips: StyleInsight[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStyleInsights(
  options: UseStyleInsightsOptions
): UseStyleInsightsReturn {
  const {
    garments,
    outfitGarmentIds,
    mood,
    weather,
    temperature,
    occasion,
    enabled = true,
  } = options;

  const [data, setData] = useState<StyleInsightsOutput>({
    gaps: [],
    completeTheLook: [],
    styleTips: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled || !garments?.length) {
      setData({ gaps: [], completeTheLook: [], styleTips: [] });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/style-insights", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garments: garments.map((g) => ({
            ...g,
            createdAt:
              g.createdAt instanceof Date
                ? g.createdAt.toISOString()
                : g.createdAt,
          })),
          outfitGarmentIds: outfitGarmentIds ?? [],
          mood,
          occasion: occasion ?? (mood ? String(mood) : undefined),
          temperature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load style insights");
      }

      const result: StyleInsightsOutput = await response.json();
      setData({
        gaps: result.gaps ?? [],
        completeTheLook: result.completeTheLook ?? [],
        styleTips: result.styleTips ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData({ gaps: [], completeTheLook: [], styleTips: [] });
    } finally {
      setLoading(false);
    }
  }, [enabled, garments, outfitGarmentIds, mood, occasion, temperature]);

  useEffect(() => {
    if (enabled && garments.length > 0) {
      refetch();
    }
  }, [enabled, garments.length, refetch]);

  return {
    gaps: data.gaps,
    completeTheLook: data.completeTheLook,
    styleTips: data.styleTips,
    loading,
    error,
    refetch,
  };
}
