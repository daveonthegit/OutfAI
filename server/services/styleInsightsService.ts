/**
 * Style insights: wardrobe gaps, complete-the-look tips, and style/occasion pairing advice.
 * Text-only, rule-based; no product catalog or external APIs.
 */

import type {
  Garment,
  GarmentCategory,
  StyleInsight,
  StyleInsightsOutput,
  Mood,
} from "../../shared/types";

const CATEGORIES: GarmentCategory[] = [
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
];

/** Key subcategories we suggest as gaps when missing (name/tags hints). */
const SUBCATEGORY_HINTS: Record<
  string,
  { category: GarmentCategory; label: string; reason?: string }
> = {
  blazer: {
    category: "outerwear",
    label: "blazer",
    reason: "You have several smart-casual tops but no blazer.",
  },
  belt: {
    category: "accessory",
    label: "belt",
    reason: "A belt can pull your look together.",
  },
  watch: {
    category: "accessory",
    label: "watch",
    reason: "A simple watch works with most outfits.",
  },
};

function hasSubcategory(garments: Garment[], hintKey: string): boolean {
  const hint = SUBCATEGORY_HINTS[hintKey];
  if (!hint) return false;
  return garments.some((g) => {
    const name = (g.name ?? "").toLowerCase();
    const tags = (g.tags ?? []).join(" ").toLowerCase();
    const combined = name + " " + tags;
    return g.category === hint.category && combined.includes(hintKey);
  });
}

function getGaps(garments: Garment[]): StyleInsight[] {
  const gaps: StyleInsight[] = [];
  const byCategory = new Map<GarmentCategory, Garment[]>();
  for (const g of garments) {
    const c = g.category as GarmentCategory;
    if (!byCategory.has(c)) byCategory.set(c, []);
    byCategory.get(c)!.push(g);
  }

  // Missing whole category
  for (const cat of CATEGORIES) {
    if (!byCategory.has(cat) || byCategory.get(cat)!.length === 0) {
      const label =
        cat === "outerwear" ? "outerwear (e.g. jacket or coat)" : cat;
      gaps.push({
        type: "gap",
        text: `You have no ${label}.`,
        category: cat,
        reason: `Consider adding a ${label} to round out your wardrobe.`,
      });
    }
  }

  // Missing key subcategories (blazer, belt, watch) — only when they have that category
  for (const key of Object.keys(SUBCATEGORY_HINTS)) {
    if (!hasSubcategory(garments, key)) {
      const hint = SUBCATEGORY_HINTS[key as keyof typeof SUBCATEGORY_HINTS];
      const count = byCategory.get(hint.category)?.length ?? 0;
      if (count > 0) {
        gaps.push({
          type: "gap",
          text: `Consider adding a ${hint.label}.`,
          category: hint.category,
          reason: hint.reason,
        });
      }
    }
  }

  return gaps;
}

function getCompleteTheLook(
  garments: Garment[],
  outfitGarmentIds: Set<string>,
  temperature?: number
): StyleInsight[] {
  const tips: StyleInsight[] = [];
  if (outfitGarmentIds.size === 0) return tips;

  const outfitGarments = garments.filter((g) =>
    outfitGarmentIds.has(String(g.id))
  );
  const hasAccessory = outfitGarments.some((g) => g.category === "accessory");
  const hasOuterwear = outfitGarments.some((g) => g.category === "outerwear");
  const hasShoes = outfitGarments.some((g) => g.category === "shoes");
  const shoeGarment = outfitGarments.find((g) => g.category === "shoes");
  const outfitColors = outfitGarments
    .filter((g) => g.category !== "shoes")
    .map((g) => (g.primaryColor ?? "").toLowerCase());

  if (!hasAccessory) {
    tips.push({
      type: "complete_the_look",
      text: "Add a watch or simple bracelet.",
      reason: "A small accessory can complete the look.",
    });
  }

  const isCold = temperature != null && temperature < 15;
  if (isCold && !hasOuterwear) {
    tips.push({
      type: "complete_the_look",
      text: "Consider a layer.",
      reason: "It's cool out—a jacket or cardigan would work well.",
    });
  }

  if (hasShoes && shoeGarment && outfitColors.length > 0) {
    const shoeColor = (shoeGarment.primaryColor ?? "").toLowerCase();
    const darkOutfit = outfitColors.some((c) =>
      ["black", "navy", "charcoal", "brown", "grey", "gray"].some((d) =>
        c.includes(d)
      )
    );
    const lightShoe = ["white", "beige", "cream", "tan"].some((l) =>
      shoeColor.includes(l)
    );
    if (darkOutfit && lightShoe) {
      tips.push({
        type: "complete_the_look",
        text: "Try a darker shoe for balance.",
        reason:
          "Your outfit is on the darker side; darker shoes will tie it together.",
      });
    }
  }

  return tips.slice(0, 3);
}

function getStyleTips(
  garments: Garment[],
  mood?: Mood,
  occasion?: string
): StyleInsight[] {
  const tips: StyleInsight[] = [];
  const context = occasion ?? mood ?? "";
  if (!context) return tips;

  const tops = garments.filter((g) => g.category === "top");
  const bottoms = garments.filter((g) => g.category === "bottom");
  if (tops.length === 0 || bottoms.length === 0) return tips;

  const top = tops[0];
  const bottom = bottoms[0];
  const occasionLabel =
    occasion ??
    (mood === "formal"
      ? "formal"
      : mood === "casual"
        ? "casual"
        : String(mood ?? "this look"));
  tips.push({
    type: "style_tip",
    text: `For ${occasionLabel}, pair your ${top.name} with your ${bottom.name}.`,
    reason: "A simple pairing that works for your wardrobe.",
  });

  if (tops.length > 1 && bottoms.length > 1) {
    const top2 = tops[1];
    const bottom2 = bottoms[1];
    tips.push({
      type: "style_tip",
      text: `Or try your ${top2.name} with your ${bottom2.name}.`,
      reason: "Another versatile combination.",
    });
  }

  return tips.slice(0, 2);
}

export interface StyleInsightsInput {
  garments: Garment[];
  outfitGarmentIds?: string[];
  mood?: Mood;
  occasion?: string;
  temperature?: number;
}

export class StyleInsightsService {
  static getInsights(input: StyleInsightsInput): StyleInsightsOutput {
    const { garments, outfitGarmentIds, mood, occasion, temperature } = input;
    if (!garments?.length) {
      return { gaps: [], completeTheLook: [], styleTips: [] };
    }

    const outfitSet = new Set((outfitGarmentIds ?? []).map(String));

    return {
      gaps: getGaps(garments),
      completeTheLook: getCompleteTheLook(garments, outfitSet, temperature),
      styleTips: getStyleTips(garments, mood, occasion),
    };
  }
}
