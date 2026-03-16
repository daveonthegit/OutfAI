"use client";

import { useMemo } from "react";
import type { Doc } from "@convex/_generated/dataModel";
import type { Garment, Mood, WeatherCondition } from "@shared/types";
import type { StyleInsight } from "@shared/types";
import { useStyleInsights } from "@/hooks/use-style-insights";

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

function InsightItem({ insight }: { insight: StyleInsight }) {
  return (
    <li className="text-[13px] text-foreground">
      <span>{insight.text}</span>
      {insight.reason && (
        <span className="block text-[11px] text-muted-foreground mt-0.5">
          {insight.reason}
        </span>
      )}
    </li>
  );
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
        <div className="space-y-8">
          {gaps.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Wardrobe gaps
              </h3>
              <ul className="space-y-2 list-none pl-0">
                {gaps.map((insight, i) => (
                  <InsightItem key={`gap-${i}`} insight={insight} />
                ))}
              </ul>
            </div>
          )}
          {completeTheLook.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Complete the look
              </h3>
              <ul className="space-y-2 list-none pl-0">
                {completeTheLook.map((insight, i) => (
                  <InsightItem key={`ctl-${i}`} insight={insight} />
                ))}
              </ul>
            </div>
          )}
          {styleTips.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Style tips
              </h3>
              <ul className="space-y-2 list-none pl-0">
                {styleTips.map((insight, i) => (
                  <InsightItem key={`tip-${i}`} insight={insight} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
