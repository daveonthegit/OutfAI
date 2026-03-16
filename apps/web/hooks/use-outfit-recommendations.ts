import { useCallback, useState } from "react";
import {
  Mood,
  WeatherCondition,
  Outfit,
  Garment,
  UserStylePreferences,
} from "@shared/types";

/**
 * useOutfitRecommendations
 *
 * Custom React hook for generating outfit recommendations.
 * Manages loading state, error handling, and caching.
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
      garments?: Garment[];
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
        garments?: Garment[];
      } = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const options = { ...initialOptions, ...overrides };

        // Convert garments to JSON-serializable format
        const garments =
          overrides.garments?.map((g) => ({
            ...g,
            createdAt:
              g.createdAt instanceof Date
                ? g.createdAt.toISOString()
                : g.createdAt,
          })) || [];

        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: options.userId,
            mood: options.mood,
            weather: options.weather,
            temperature: options.temperature,
            occasion: options.occasion,
            limitCount: options.limitCount,
            preferences: options.preferences,
            recentGarmentIds,
            garments,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate recommendations");
        }

        const data = await response.json();
        const nextOutfits: Outfit[] = data.outfits || [];
        setOutfits(nextOutfits);
        setExplanation(data.explanation || "");

        // Keep a short rolling history of recently used garment IDs
        const nextRecent = nextOutfits
          .flatMap((o) => o.garmentIds ?? [])
          .filter(Boolean);
        if (nextRecent.length > 0) {
          setRecentGarmentIds((prev) => {
            const merged = [...nextRecent, ...prev];
            // de-dupe while preserving order
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
