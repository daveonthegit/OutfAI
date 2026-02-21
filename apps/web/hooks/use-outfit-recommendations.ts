import { useCallback, useState } from "react";
import { Mood, WeatherCondition, Outfit } from "@/../../shared/types";

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
}

interface UseOutfitRecommendationsReturn {
  outfits: Outfit[];
  loading: boolean;
  error: string | null;
  explanation: string;
  generate: (
    options: Partial<UseOutfitRecommendationsOptions>
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

  const generate = useCallback(
    async (overrides: Partial<UseOutfitRecommendationsOptions> = {}) => {
      setLoading(true);
      setError(null);

      try {
        const options = { ...initialOptions, ...overrides };

        // Call the tRPC endpoint
        // In a real implementation, you would use the tRPC client:
        // const result = await trpc.recommendations.generate.query(options);

        // For now, simulate the API call
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "recommendations.generate",
            params: options,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate recommendations");
        }

        const data = await response.json();
        setOutfits(data.outfits || []);
        setExplanation(data.explanation || "");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setOutfits([]);
      } finally {
        setLoading(false);
      }
    },
    [initialOptions]
  );

  const reset = useCallback(() => {
    setOutfits([]);
    setError(null);
    setExplanation("");
  }, []);

  return { outfits, loading, error, explanation, generate, reset };
}
