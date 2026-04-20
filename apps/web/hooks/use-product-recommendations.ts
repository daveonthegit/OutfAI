"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Garment,
  ProductRecommendation,
  Mood,
  WeatherCondition,
} from "@shared/types";

interface UseProductRecommendationsOptions {
  userId: string;
  garments: Garment[];
  /** Current outfit garment IDs (optional) */
  outfitGarmentIds?: string[];
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  limitCount?: number;
  /** Only fetch when true (e.g. after outfit results exist) */
  enabled?: boolean;
}

interface UseProductRecommendationsReturn {
  recommendations: ProductRecommendation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProductRecommendations(
  options: UseProductRecommendationsOptions
): UseProductRecommendationsReturn {
  const {
    userId,
    garments,
    outfitGarmentIds,
    mood,
    weather,
    temperature,
    limitCount = 4,
    enabled = true,
  } = options;

  const [recommendations, setRecommendations] = useState<
    ProductRecommendation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled || !userId || !garments?.length) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/product-recommendations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentIds: garments.map((g) => g.id),
          outfitGarmentIds,
          mood,
          weather,
          temperature,
          limitCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    userId,
    garments,
    outfitGarmentIds,
    mood,
    weather,
    temperature,
    limitCount,
  ]);

  useEffect(() => {
    if (enabled && garments.length > 0 && userId) {
      refetch();
    }
  }, [enabled, garments.length, userId, refetch]);

  return { recommendations, loading, error, refetch };
}
