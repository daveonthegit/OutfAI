/**
 * Wardrobe-first external product recommendation service.
 * Suggests external products that complement the user's existing wardrobe.
 * Scoring is explainable and rule-based; recommendations appear only after outfit results.
 */

import type {
  Garment,
  ExternalProduct,
  ProductRecommendation,
  ProductRecommendationInput,
  ProductRecommendationOutput,
  ProductRecommendationSourceContext,
  GarmentCategory,
  Mood,
} from "../../shared/types";

const CATEGORIES: GarmentCategory[] = [
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
];

interface ScoredProduct {
  product: ExternalProduct;
  score: number;
  matchedGarmentIds: string[];
  sourceContext: ProductRecommendationSourceContext;
  reasonParts: string[];
}

export class ProductRecommendationService {
  /**
   * Generate product recommendations grounded in the user's garments and optional context.
   */
  static recommend(
    products: ExternalProduct[],
    input: ProductRecommendationInput
  ): ProductRecommendationOutput {
    if (!input.garments?.length || !products.length) {
      return { recommendations: [] };
    }

    const garments = input.garments;
    const outfitGarmentIds = new Set(input.outfitGarmentIds ?? []);
    const mood = input.mood ?? "casual";

    const scored: ScoredProduct[] = products.map((product) => {
      const { score, matchedGarmentIds, sourceContext, reasonParts } =
        this.scoreProduct(product, garments, outfitGarmentIds, mood, input);
      return {
        product,
        score,
        matchedGarmentIds,
        sourceContext,
        reasonParts,
      };
    });

    // Filter by minimum score, sort by score desc, then diversify (prefer different categories)
    const MIN_SCORE = 20;
    const sorted = scored
      .filter((s) => s.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score);

    const limit = Math.min(input.limitCount ?? 4, 8);
    const selected = this.diversifyByCategory(sorted, limit);

    const recommendations: ProductRecommendation[] = selected.map((s) => ({
      product: s.product,
      reason: this.buildReason(s),
      score: s.score,
      matchedGarmentIds: s.matchedGarmentIds,
      sourceContext: s.sourceContext,
    }));

    return { recommendations };
  }

  private static scoreProduct(
    product: ExternalProduct,
    garments: Garment[],
    outfitGarmentIds: Set<string>,
    mood: Mood,
    input: ProductRecommendationInput
  ): {
    score: number;
    matchedGarmentIds: string[];
    sourceContext: ProductRecommendationSourceContext;
    reasonParts: string[];
  } {
    let score = 0;
    const matchedGarmentIds: string[] = [];
    const reasonParts: string[] = [];
    let sourceContext: ProductRecommendationSourceContext = "versatile-piece";

    // 1) Wardrobe gap: category the user has few or none of
    const categoryCounts = this.countByCategory(garments);
    const productCategory = product.category as GarmentCategory;
    const gapScore = this.scoreWardrobeGap(productCategory, categoryCounts);
    if (gapScore > 0) {
      score += gapScore;
      sourceContext = "wardrobe-gap";
      const gapLabel = this.getCategoryGapLabel(
        productCategory,
        categoryCounts
      );
      if (gapLabel) reasonParts.push(gapLabel);
    }

    // 2) Color compatibility with existing garments
    const productColor = product.color?.toLowerCase();
    if (productColor) {
      const { colorScore, matchingIds } = this.scoreColorMatch(
        productColor,
        garments
      );
      if (colorScore > 0) {
        score += colorScore;
        matchedGarmentIds.push(...matchingIds);
        if (sourceContext !== "wardrobe-gap") sourceContext = "color-match";
        reasonParts.push(
          this.getColorMatchReason(productColor, matchingIds.length)
        );
      }
    }

    // 3) Style/occasion alignment with wardrobe and mood
    const styleScore = this.scoreStyleOccasion(product, garments, mood);
    if (styleScore > 0) {
      score += styleScore;
      if (reasonParts.length < 2)
        reasonParts.push("Complements your existing style");
      if (sourceContext === "versatile-piece")
        sourceContext = "style-alignment";
    }

    // 4) Layering: outerwear when user has tops/bottoms
    if (productCategory === "outerwear") {
      const hasTops =
        categoryCounts.get("top") && categoryCounts.get("top")! > 0;
      const hasBottoms =
        categoryCounts.get("bottom") && categoryCounts.get("bottom")! > 0;
      if (hasTops && hasBottoms) {
        score += 8;
        if (!reasonParts.some((p) => p.toLowerCase().includes("layer")))
          reasonParts.push("Adds a versatile layer to your looks");
        sourceContext = "layering";
      }
    }

    // 5) Penalize products too similar to what user already has (same category + same color)
    const similarityPenalty = this.penalizeSimilarToOwned(product, garments);
    score = Math.max(0, score - similarityPenalty);

    return {
      score,
      matchedGarmentIds: [...new Set(matchedGarmentIds)],
      sourceContext,
      reasonParts,
    };
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

  private static scoreWardrobeGap(
    category: GarmentCategory,
    categoryCounts: Map<GarmentCategory, number>
  ): number {
    const count = categoryCounts.get(category) ?? 0;
    if (count === 0) return 25; // Missing category entirely
    if (count === 1) return 12; // Only one item in that category
    if (count === 2) return 5;
    return 0;
  }

  private static getCategoryGapLabel(
    category: GarmentCategory,
    categoryCounts: Map<GarmentCategory, number>
  ): string {
    const count = categoryCounts.get(category) ?? 0;
    const labels: Record<GarmentCategory, string> = {
      top: "tops",
      bottom: "bottoms",
      shoes: "shoes",
      outerwear: "outerwear",
      accessory: "accessories",
    };
    const name = labels[category] ?? category;
    if (count === 0) return `Adds ${name} to your wardrobe`;
    if (count === 1) return `Another ${name.slice(0, -1)} option to rotate`;
    return "";
  }

  private static scoreColorMatch(
    productColor: string,
    garments: Garment[]
  ): { colorScore: number; matchingIds: string[] } {
    const neutrals = [
      "black",
      "white",
      "gray",
      "grey",
      "navy",
      "beige",
      "brown",
    ];
    const productIsNeutral = neutrals.some((n) => productColor.includes(n));
    const matchingIds: string[] = [];
    let colorScore = 0;

    for (const g of garments) {
      const gColor = g.primaryColor?.toLowerCase() ?? "";
      if (!gColor) continue;
      if (gColor === productColor) {
        matchingIds.push(g.id);
        colorScore += 6; // Same color → pairs well
      } else if (productIsNeutral || neutrals.some((n) => gColor.includes(n))) {
        colorScore += 3; // Neutral goes with many things
      }
    }
    return {
      colorScore: Math.min(colorScore, 20),
      matchingIds,
    };
  }

  private static getColorMatchReason(
    productColor: string,
    matchCount: number
  ): string {
    const neutrals = [
      "black",
      "white",
      "gray",
      "grey",
      "navy",
      "beige",
      "brown",
    ];
    const isNeutral = neutrals.some((n) => productColor.includes(n));
    if (isNeutral && matchCount > 0)
      return `Neutral tone that pairs with several of your pieces`;
    if (matchCount > 0) return `Pairs with your ${productColor} pieces`;
    return "";
  }

  private static scoreStyleOccasion(
    product: ExternalProduct,
    garments: Garment[],
    mood: Mood
  ): number {
    const productStyles = new Set(
      (product.styleTags ?? []).map((s) => s.toLowerCase())
    );
    const productOccasions = new Set(
      (product.occasionTags ?? []).map((o) => o.toLowerCase())
    );
    const moodOccasions: Record<Mood, string[]> = {
      casual: ["casual", "weekend"],
      formal: ["formal", "work"],
      adventurous: ["weekend", "casual"],
      cozy: ["casual", "weekend"],
      energetic: ["casual", "work"],
      minimalist: ["work", "smart-casual", "formal"],
      bold: ["night", "weekend", "casual"],
    };
    const targetOccasions = moodOccasions[mood] ?? [];

    let score = 0;
    for (const g of garments) {
      const gStyles = (g.style ?? []).map((s) => s.toLowerCase());
      const gOccasions = (g.occasion ?? []).map((o) => o.toLowerCase());
      if (g.tags) {
        g.tags.forEach((t) => {
          const tLower = t.toLowerCase();
          if (
            [
              "casual",
              "formal",
              "work",
              "smart-casual",
              "weekend",
              "night",
            ].includes(tLower)
          )
            gOccasions.push(tLower);
        });
      }
      const styleOverlap = gStyles.some((s) => productStyles.has(s));
      const occasionOverlap =
        targetOccasions.some((o) => productOccasions.has(o)) ||
        gOccasions.some((o) => productOccasions.has(o));
      if (styleOverlap) score += 3;
      if (occasionOverlap) score += 4;
    }
    return Math.min(score, 15);
  }

  private static penalizeSimilarToOwned(
    product: ExternalProduct,
    garments: Garment[]
  ): number {
    const productCategory = product.category as GarmentCategory;
    const productColor = product.color?.toLowerCase();
    let penalty = 0;
    for (const g of garments) {
      if ((g.category as GarmentCategory) !== productCategory) continue;
      const gColor = g.primaryColor?.toLowerCase();
      if (productColor && gColor && productColor === gColor)
        penalty += 15; // Same category + same color
      else penalty += 5; // Same category only
    }
    return penalty;
  }

  private static diversifyByCategory(
    sorted: ScoredProduct[],
    limit: number
  ): ScoredProduct[] {
    const byCategory = new Map<string, ScoredProduct[]>();
    for (const s of sorted) {
      const c = s.product.category;
      if (!byCategory.has(c)) byCategory.set(c, []);
      byCategory.get(c)!.push(s);
    }
    const result: ScoredProduct[] = [];
    const categories = [...byCategory.keys()];
    let round = 0;
    while (result.length < limit && round < 10) {
      for (const c of categories) {
        const list = byCategory.get(c)!;
        const idx = round < list.length ? round : 0;
        if (list[idx] && !result.includes(list[idx])) {
          result.push(list[idx]);
          if (result.length >= limit) break;
        }
      }
      if (result.length >= limit) break;
      round++;
    }
    // If we didn't fill, append remaining by score
    if (result.length < limit) {
      for (const s of sorted) {
        if (result.length >= limit) break;
        if (!result.includes(s)) result.push(s);
      }
    }
    return result.slice(0, limit);
  }

  private static buildReason(s: ScoredProduct): string {
    const parts = s.reasonParts.filter(Boolean);
    if (parts.length === 0) return "Complements your wardrobe.";
    if (parts.length === 1) return parts[0] + ".";
    return parts.slice(0, 2).join(". ") + ".";
  }
}
