"use client";

import { useEffect, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { Garment, Mood, WeatherCondition } from "@shared/types";
import { useProductRecommendations } from "@/hooks/use-product-recommendations";
import { ExternalProductCard } from "@/components/external-product-card";

interface SuggestedProductsSectionProps {
  userId: string;
  garments: Doc<"garments">[];
  /** Garment IDs of the currently displayed outfit (optional) */
  outfitGarmentIds?: string[];
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  /** Only show when outfit results exist (wardrobe-first) */
  showWhenHasOutfits: boolean;
}

function mapConvexGarmentToGarment(g: Doc<"garments">): Garment {
  return {
    id: g._id,
    userId: g.userId,
    name: g.name,
    category: g.category as Garment["category"],
    primaryColor: g.primaryColor,
    tags: g.tags,
    style: g.style,
    fit: g.fit,
    occasion: g.occasion,
    versatility: g.versatility as Garment["versatility"],
    vibrancy: g.vibrancy as Garment["vibrancy"],
    material: g.material,
    season: g.season as Garment["season"],
    imageUrl: g.imageUrl,
    createdAt: new Date(g._creationTime),
  };
}

export function SuggestedProductsSection({
  userId,
  garments,
  outfitGarmentIds,
  mood,
  weather,
  temperature,
  showWhenHasOutfits,
}: SuggestedProductsSectionProps) {
  const garmentList = useMemo(
    () => garments.map(mapConvexGarmentToGarment),
    [garments]
  );
  const outfitGarmentIdsStable = useMemo(
    () => outfitGarmentIds?.map(String) ?? [],
    [outfitGarmentIds]
  );
  const seedDevProducts = useMutation(api.externalProducts.seedDevProducts);

  const { recommendations, loading, error, refetch } =
    useProductRecommendations({
      userId,
      garments: garmentList,
      outfitGarmentIds: outfitGarmentIdsStable,
      mood,
      weather,
      temperature,
      limitCount: 4,
      enabled: showWhenHasOutfits && garmentList.length > 0,
    });

  // When section becomes visible and we have garments, ensure external products exist (dev seed) and fetch recommendations
  useEffect(() => {
    if (!showWhenHasOutfits || garmentList.length === 0) return;
    seedDevProducts().catch(() => {
      // Ignore if already seeded or unauthorized
    });
  }, [showWhenHasOutfits, garmentList.length, seedDevProducts]);

  useEffect(() => {
    if (showWhenHasOutfits && garmentList.length > 0) {
      refetch();
    }
  }, [showWhenHasOutfits, garmentList.length, refetch]);

  if (!showWhenHasOutfits) return null;
  if (garmentList.length === 0) return null;

  return (
    <section className="border-t border-border pt-10 md:pt-14 mb-16 md:mb-24">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
        Suggested for your wardrobe
      </h2>
      <p className="text-[11px] text-muted-foreground mb-6 max-w-xl">
        External products that complement what you own. Each suggestion opens in
        a new tab.
      </p>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square bg-secondary border border-border animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="py-8 text-center">
          <p className="text-[11px] text-muted-foreground">
            Suggestions are temporarily unavailable.
          </p>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-[11px] text-muted-foreground">
            No product suggestions right now. Add more items to your closet to
            get tailored ideas.
          </p>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {recommendations.map((rec) => (
            <ExternalProductCard
              key={rec.product.id}
              recommendation={rec}
              onTrackClick={undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
