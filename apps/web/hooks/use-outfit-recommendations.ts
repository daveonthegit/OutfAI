import { useCallback, useState } from "react";
import {
  Mood,
  WeatherCondition,
  Outfit,
  UserStylePreferences,
} from "@shared/types";

/**
 * useOutfitRecommendations
 *
 * Custom React hook for generating outfit recommendations.
 * Manages loading state, error handling, and caching.
 * Garments are loaded server-side; optional `garmentIds` filters the closet subset.
 */

interface UseOutfitRecommendationsOptions {
  userId: string;
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  occasion?: string;
  limitCount?: number;
  preferences?: UserStylePreferences;
}

interface UseOutfitRecommendationsReturn {
  outfits: Outfit[];
  loading: boolean;
  error: string | null;
  explanation: string;
  generate: (
    options: Partial<UseOutfitRecommendationsOptions> & {
      /** Subset of closet garment IDs; omit to use the full closet. */
      garmentIds?: string[];
    }
  ) => Promise<void>;
  reset: () => void;
}

export function useOutfitRecommendations(
  initialOptions: UseOutfitRecommendationsOptions
): UseOutfitRecommendationsReturn {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [recentGarmentIds, setRecentGarmentIds] = useState<string[]>([]);

  const generate = useCallback(
    async (
      overrides: Partial<UseOutfitRecommendationsOptions> & {
        garmentIds?: string[];
      } = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const options = { ...initialOptions, ...overrides };

        const response = await fetch("/api/recommendations", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mood: options.mood,
            weather: options.weather,
            temperature: options.temperature,
            occasion: options.occasion,
            limitCount: options.limitCount,
            preferences: options.preferences,
            recentGarmentIds,
            garmentIds: overrides.garmentIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate recommendations");
        }

        const data = await response.json();
        const nextOutfits: Outfit[] = data.outfits || [];
        setOutfits(nextOutfits);
        setExplanation(data.explanation || "");

        const nextRecent = nextOutfits
          .flatMap((o) => o.garmentIds ?? [])
          .filter(Boolean);
        if (nextRecent.length > 0) {
          setRecentGarmentIds((prev) => {
            const merged = [...nextRecent, ...prev];
            const seen = new Set<string>();
            const unique = merged.filter((id) => {
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
            return unique.slice(0, 20);
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setOutfits([]);
      } finally {
        setLoading(false);
      }
    },
    [initialOptions, recentGarmentIds]
  );

  const reset = useCallback(() => {
    setOutfits([]);
    setError(null);
    setExplanation("");
    setRecentGarmentIds([]);
  }, []);

  return { outfits, loading, error, explanation, generate, reset };
}
