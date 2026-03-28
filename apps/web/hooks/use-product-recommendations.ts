"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type {
  Garment,
  ExternalProduct,
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

function mapConvexProductToExternal(
  doc: Doc<"external_products">
): ExternalProduct {
  return {
    id: doc._id,
    source: doc.source,
    sourceProductId: doc.sourceProductId,
    name: doc.name,
    brand: doc.brand,
    category: doc.category,
    subcategory: doc.subcategory,
    color: doc.color,
    styleTags: doc.styleTags,
    occasionTags: doc.occasionTags,
    price: doc.price,
    currency: doc.currency,
    imageUrl: doc.imageUrl,
    productUrl: doc.productUrl,
    affiliateUrl: doc.affiliateUrl,
    availability: doc.availability,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
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

  const externalProducts = useQuery(
    api.externalProducts.list,
    enabled ? { limit: 40 } : "skip"
  );

  const refetch = useCallback(async () => {
    if (!enabled || !userId || !garments?.length) {
      setRecommendations([]);
      return;
    }
    if (!externalProducts?.length) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const products = externalProducts.map(mapConvexProductToExternal);
      const response = await fetch("/api/product-recommendations", {
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
          products,
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
    externalProducts,
    outfitGarmentIds,
    mood,
    weather,
    temperature,
    limitCount,
  ]);

  // When external products become available (e.g. after dev seed), refetch recommendations
  useEffect(() => {
    if (
      enabled &&
      (externalProducts?.length ?? 0) > 0 &&
      garments.length > 0 &&
      userId
    ) {
      refetch();
    }
  }, [enabled, externalProducts?.length, garments.length, userId, refetch]);

  return { recommendations, loading, error, refetch };
}
