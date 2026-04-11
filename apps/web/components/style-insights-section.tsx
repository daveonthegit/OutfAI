"use client";

import { useMemo, useState } from "react";
import type { Doc } from "@convex/_generated/dataModel";
import type { Garment, Mood, WeatherCondition } from "@shared/types";
import { useStyleInsights } from "@/hooks/use-style-insights";
import { StyleInsightsModal } from "@/components/style-insights-modal";

interface StyleInsightsSectionProps {
  userId: string;
  garments: Doc<"garments">[];
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

export function StyleInsightsSection({
  userId: _userId,
  garments,
  outfitGarmentIds,
  mood,
  weather,
  temperature,
  showWhenHasOutfits,
}: StyleInsightsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const garmentList = useMemo(
    () => garments.map(mapConvexGarmentToGarment),
    [garments]
  );
  const outfitGarmentIdsStable = useMemo(
    () => outfitGarmentIds?.map(String) ?? [],
    [outfitGarmentIds]
  );

  const { gaps, completeTheLook, styleTips, loading, error } = useStyleInsights(
    {
      garments: garmentList,
      outfitGarmentIds: outfitGarmentIdsStable,
      mood,
      weather,
      temperature,
      occasion: mood,
      enabled: showWhenHasOutfits && garmentList.length > 0,
    }
  );

  if (!showWhenHasOutfits) return null;
  if (garmentList.length === 0) return null;

  const hasAny =
    gaps.length > 0 || completeTheLook.length > 0 || styleTips.length > 0;

  return (
    <section className="border-t border-border pt-10 md:pt-14 mb-16 md:mb-24">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
        Style insights
      </h2>
      <p className="text-[11px] text-muted-foreground mb-6 max-w-xl">
        Gaps, complete-the-look tips, and pairing ideas for your wardrobe.
      </p>

      {loading && (
        <div className="space-y-3">
          <div className="h-4 bg-secondary border border-border animate-pulse rounded w-3/4" />
          <div className="h-4 bg-secondary border border-border animate-pulse rounded w-1/2" />
          <div className="h-4 bg-secondary border border-border animate-pulse rounded w-2/3" />
        </div>
      )}

      {error && (
        <div className="py-8 text-center">
          <p className="text-[11px] text-muted-foreground">
            Insights are temporarily unavailable.
          </p>
        </div>
      )}

      {!loading && !error && !hasAny && (
        <div className="py-8 text-center">
          <p className="text-[11px] text-muted-foreground">
            Your wardrobe looks well-rounded. Add more items or try a different
            mood to get tailored tips.
          </p>
        </div>
      )}

      {!loading && !error && hasAny && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full text-left glass-panel rounded-sm px-5 py-4 flex items-center justify-between group transition-colors duration-100 hover:border-signal-orange/80"
        >
          <span className="text-[13px] text-foreground">
            View style insights
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
            {gaps.length + completeTheLook.length + styleTips.length} tips
          </span>
        </button>
      )}

      <StyleInsightsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        gaps={gaps}
        completeTheLook={completeTheLook}
        styleTips={styleTips}
      />
    </section>
  );
}
