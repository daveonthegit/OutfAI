/**
 * Explainable closet gap detection.
 * Analyzes the user's wardrobe and returns structured gaps (missing staples, layers, shoes, etc.)
 * for use by the live product recommendation engine. No mock data.
 */

import type {
  Garment,
  ClosetGap,
  ClosetGapType,
  GarmentCategory,
} from "../../shared/types";

const CATEGORIES: GarmentCategory[] = [
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
];

const NEUTRALS = new Set([
  "black",
  "white",
  "gray",
  "grey",
  "navy",
  "beige",
  "brown",
]);

export interface ClosetGapInput {
  garments: Garment[];
  /** Optional: current weather for weather-appropriate gap detection */
  weather?: string;
  /** Optional: temperature for outerwear gaps */
  temperature?: number;
  /** Optional: mood/occasion for formal/casual gap context */
  mood?: string;
}

export class ClosetGapService {
  /**
   * Detect explainable closet gaps from the user's wardrobe.
   */
  static detectGaps(input: ClosetGapInput): ClosetGap[] {
    const { garments, weather, temperature, mood } = input;
    if (!garments?.length) return [];

    const gaps: ClosetGap[] = [];
    const byCategory = this.countByCategory(garments);
    const colors = garments
      .map((g) => g.primaryColor?.toLowerCase())
      .filter(Boolean) as string[];
    const hasNeutral = colors.some((c) => NEUTRALS.has(c));
    const hasTops = (byCategory.get("top") ?? 0) > 0;
    const hasBottoms = (byCategory.get("bottom") ?? 0) > 0;

    // Missing or weak category coverage
    for (const cat of CATEGORIES) {
      const count = byCategory.get(cat) ?? 0;
      if (count === 0) {
        const gap = this.gapForMissingCategory(
          cat,
          garments,
          weather,
          temperature,
          mood
        );
        if (gap) gaps.push(gap);
      } else if (
        count === 1 &&
        (cat === "shoes" || cat === "outerwear" || cat === "accessory")
      ) {
        const gap = this.gapForWeakCategory(cat, garments);
        if (gap) gaps.push(gap);
      }
    }

    // Missing neutral layer (have tops/bottoms but no neutral outerwear)
    if (hasTops && hasBottoms && (byCategory.get("outerwear") ?? 0) === 0) {
      gaps.push({
        gapType: "missing_neutral_layer",
        severity: "medium",
        targetCategories: ["outerwear"],
        targetColors: ["navy", "black", "gray", "beige"],
        styleOccasionContext: ["casual", "smart-casual"],
        supportingGarmentIds: garments
          .filter((g) => g.category === "top" || g.category === "bottom")
          .map((g) => g.id),
        explanation:
          "You have tops and bottoms but no neutral outer layer to pair with them.",
      });
    }

    // Missing versatile shoes (no shoes or only one pair)
    const shoeCount = byCategory.get("shoes") ?? 0;
    if (shoeCount === 0) {
      gaps.push({
        gapType: "missing_versatile_shoes",
        severity: "high",
        targetCategories: ["shoes"],
        targetColors: ["white", "black", "brown", "navy"],
        supportingGarmentIds: [],
        explanation:
          "Adding a versatile shoe option would complete many of your outfits.",
      });
    }

    // Missing formal shoes (have formal tops/bottoms but no formal-appropriate shoes)
    const formalGarments = garments.filter(
      (g) =>
        g.occasion?.includes("formal") ||
        g.tags?.some((t) => /formal|work|dress/.test(t.toLowerCase()))
    );
    const hasFormalShoes = garments.some(
      (g) =>
        g.category === "shoes" &&
        (g.occasion?.includes("formal") ||
          g.tags?.some((t) => /formal|dress/.test(t.toLowerCase())))
    );
    if (formalGarments.length > 0 && !hasFormalShoes && shoeCount > 0) {
      gaps.push({
        gapType: "missing_formal_shoes",
        severity: "medium",
        targetCategories: ["shoes"],
        styleOccasionContext: ["formal", "work"],
        supportingGarmentIds: formalGarments.map((g) => g.id),
        explanation:
          "Your closet includes dressier pieces but lacks a formal shoe option to match.",
      });
    }

    // Weather-appropriate outerwear
    if (
      temperature !== undefined &&
      temperature < 15 &&
      (byCategory.get("outerwear") ?? 0) === 0
    ) {
      gaps.push({
        gapType: "missing_weather_outerwear",
        severity: "high",
        targetCategories: ["outerwear"],
        supportingGarmentIds: [],
        explanation:
          "Cooler weather makes a coat or jacket a practical addition.",
      });
    }

    // Weak formal coverage (no formal pieces at all)
    if (
      formalGarments.length === 0 &&
      (byCategory.get("top") ?? 0) + (byCategory.get("bottom") ?? 0) >= 2
    ) {
      gaps.push({
        gapType: "weak_formal_coverage",
        severity: "low",
        targetCategories: ["top", "bottom", "outerwear"],
        styleOccasionContext: ["formal", "smart-casual"],
        supportingGarmentIds: garments.slice(0, 3).map((g) => g.id),
        explanation:
          "Adding a dressier piece would expand outfit options for work or events.",
      });
    }

    return gaps;
  }

  private static countByCategory(
    garments: Garment[]
  ): Map<GarmentCategory, number> {
    const m = new Map<GarmentCategory, number>();
    for (const c of CATEGORIES) m.set(c, 0);
    for (const g of garments) {
      const cat = g.category as GarmentCategory;
      if (CATEGORIES.includes(cat)) m.set(cat, (m.get(cat) ?? 0) + 1);
    }
    return m;
  }

  private static gapForMissingCategory(
    category: GarmentCategory,
    garments: Garment[],
    weather?: string,
    temperature?: number,
    mood?: string
  ): ClosetGap | null {
    const labels: Record<GarmentCategory, string> = {
      top: "tops",
      bottom: "bottoms",
      shoes: "shoes",
      outerwear: "outerwear",
      accessory: "accessories",
    };
    const name = labels[category];
    let gapType: ClosetGapType = "weak_category_coverage";
    if (category === "outerwear") gapType = "missing_neutral_layer";
    else if (category === "shoes") gapType = "missing_versatile_shoes";

    return {
      gapType,
      severity:
        category === "shoes" || category === "outerwear" ? "high" : "medium",
      targetCategories: [category],
      supportingGarmentIds: garments.map((g) => g.id),
      explanation: `You don't have any ${name} yet. Adding ${name} would round out your wardrobe.`,
    };
  }

  private static gapForWeakCategory(
    category: GarmentCategory,
    garments: Garment[]
  ): ClosetGap | null {
    const labels: Record<GarmentCategory, string> = {
      top: "tops",
      bottom: "bottoms",
      shoes: "shoes",
      outerwear: "outerwear",
      accessory: "accessories",
    };
    const name = labels[category];
    return {
      gapType: "insufficient_basics",
      severity: "low",
      targetCategories: [category],
      supportingGarmentIds: garments
        .filter((g) => g.category === category)
        .map((g) => g.id),
      explanation: `Another ${name.slice(0, -1)} option would give you more variety.`,
    };
  }
}
