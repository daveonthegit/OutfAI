import {
  Garment,
  RecommendationInput,
  RecommendationOutput,
  Mood,
  WeatherCondition,
  GarmentCategory,
  UserStylePreferences,
  ScoreBreakdown,
  ClosetGap,
} from "../../shared/types";

/**
 * OutfitRecommendationService
 *
 * Core business logic for generating context-aware outfit recommendations.
 * Uses rule-based constraints and simple scoring to ensure explainable results.
 *
 * Scoring System:
 * - Base Score: 50 points
 * - Color Harmony: +0-20 points
 * - Mood Alignment: +0-20 points
 * - Style Coherence: +0-15 points
 * - Occasion Matching: +0-12 points
 * - Versatility: +0-8 points
 * - Diversity: +5-10 points
 * - User Preferences: +0-15 points
 * - Total Range: 50-100 points
 * - Minimum Threshold: 60 points (must pass to be recommended)
 *
 * Outfits are ranked by score and up to 8 passing suggestions are returned (or input.limitCount).
 * If fewer than 8 outfits meet the 60-point threshold, only those are returned.
 */

interface OutfitCandidate {
  garmentIds: string[];
  score: number;
  reasons: string[];
  scoreBreakdown?: ScoreBreakdown;
}

export class OutfitRecommendationService {
  /**
   * Generate outfit recommendations based on user inputs
   */
  static async generateOutfits(
    garments: Garment[],
    input: RecommendationInput
  ): Promise<RecommendationOutput> {
    // Validate input
    if (!garments || garments.length === 0) {
      const gaps = this.getClosetGaps(garments ?? [], input);
      return {
        outfits: [],
        explanation: "No garments found in wardrobe. Please add items first.",
        totalGenerated: 0,
        gaps,
      };
    }

    // Filter garments based on constraints
    const filteredGarments = this.filterByContext(garments, input);

    if (filteredGarments.length === 0) {
      const gaps = this.getClosetGaps(garments, input);
      return {
        outfits: [],
        explanation:
          "No suitable outfits found for the current weather and mood combination.",
        totalGenerated: 0,
        gaps,
      };
    }

    // Generate candidate outfits
    const candidates = this.generateCandidates(
      filteredGarments,
      input.mood || "casual",
      input.preferences,
      input.recentGarmentIds
    );

    // Minimum score threshold - outfits must meet this quality bar
    const MIN_SCORE_THRESHOLD = 60;

    // De-dupe candidates (same garment set can be produced via different paths)
    const dedupedCandidates = this.dedupeCandidates(candidates);

    // Score and rank candidates, filter by minimum score
    const sortedCandidates = dedupedCandidates.sort(
      (a, b) => b.score - a.score
    );
    const rankedCandidates = sortedCandidates
      .filter((candidate) => candidate.score >= MIN_SCORE_THRESHOLD)
      .slice(0, input.limitCount ?? 8);

    const usedCandidates =
      rankedCandidates.length > 0
        ? rankedCandidates
        : // Adaptive threshold: if nothing passes, return best few anyway
          sortedCandidates.slice(0, Math.min(3, input.limitCount ?? 8));

    // If still none, return empty with explanation
    if (usedCandidates.length === 0) {
      const gaps = this.getClosetGaps(filteredGarments, input);
      return {
        outfits: [],
        explanation:
          "No outfit combinations found. Try adding more items (at least one top and one bottom) or adjusting filters.",
        totalGenerated: 0,
        gaps,
      };
    }

    // Convert to outfit objects
    const outfits = usedCandidates.map((candidate, index) => ({
      id: `outfit-${Date.now()}-${index}`,
      userId: input.userId,
      garmentIds: candidate.garmentIds,
      contextWeather: input.weather,
      contextMood: input.mood,
      explanation: candidate.reasons.join(" • "),
      score: candidate.score,
      scoreBreakdown: candidate.scoreBreakdown,
      createdAt: new Date(),
    }));

    return {
      outfits,
      explanation:
        rankedCandidates.length > 0
          ? this.generateExplanation(input)
          : "Limited wardrobe variety — showing best available matches. " +
            this.generateExplanation(input),
      totalGenerated: outfits.length,
      gaps:
        rankedCandidates.length > 0
          ? undefined
          : this.getClosetGaps(filteredGarments, input),
    };
  }

  /**
   * Closet gap fallback: when we can't generate strong outfits, return a simple
   * "what you're missing" hint using existing ClosetGap types.
   */
  private static getClosetGaps(
    garments: Garment[],
    input: RecommendationInput
  ): ClosetGap[] {
    const byCategory = this.groupByCategory(garments);
    const tops = byCategory.get("top")?.length ?? 0;
    const bottoms = byCategory.get("bottom")?.length ?? 0;
    const shoes = byCategory.get("shoes")?.length ?? 0;
    const outerwear = byCategory.get("outerwear")?.length ?? 0;

    const gaps: ClosetGap[] = [];

    if (tops === 0 || bottoms === 0) {
      gaps.push({
        gapType: "weak_category_coverage",
        severity: "high",
        targetCategories: [
          ...(tops === 0 ? (["top"] as GarmentCategory[]) : []),
          ...(bottoms === 0 ? (["bottom"] as GarmentCategory[]) : []),
        ],
        supportingGarmentIds: garments.map((g) => g.id),
        explanation:
          "To generate outfits, you need at least one top and one bottom.",
      });
    }

    if (tops > 0 && bottoms > 0 && shoes === 0) {
      gaps.push({
        gapType: "missing_versatile_shoes",
        severity: "medium",
        targetCategories: ["shoes"],
        supportingGarmentIds: garments.map((g) => g.id),
        explanation:
          "Add shoes to complete outfits (even one versatile pair helps a lot).",
      });
    }

    const coldish =
      input.weather === "cold" ||
      input.weather === "snowy" ||
      (typeof input.temperature === "number" && input.temperature < 10);
    const wet =
      input.weather === "rainy" ||
      input.weather === "snowy" ||
      input.weather === "windy";

    if ((coldish || wet) && outerwear === 0) {
      gaps.push({
        gapType: "missing_weather_outerwear",
        severity: "medium",
        targetCategories: ["outerwear"],
        supportingGarmentIds: garments.map((g) => g.id),
        explanation:
          "For this weather, add an outerwear piece (jacket/coat) to improve matches.",
      });
    }

    // Keep it simple: return at most 2 clear gaps
    return gaps.slice(0, 2);
  }

  /**
   * Filter garments based on weather and season
   */
  private static filterByContext(
    garments: Garment[],
    input: RecommendationInput
  ): Garment[] {
    return garments.filter((garment) => {
      // Check season compatibility with weather
      if (input.weather) {
        const isSeasonAppropriate = this.isSeasonAppropriate(
          garment.season,
          input.weather,
          input.temperature
        );
        if (!isSeasonAppropriate) return false;
      }

      // Filter by temperature if provided
      if (input.temperature !== undefined) {
        const isTemperatureAppropriate = this.isTemperatureAppropriate(
          garment,
          input.temperature
        );
        if (!isTemperatureAppropriate) return false;
      }

      return true;
    });
  }

  /**
   * Check if garment season is appropriate for weather.
   * Garments with no season set (undefined / null / empty) are treated as
   * all-season so they are never incorrectly filtered out.
   */
  private static isSeasonAppropriate(
    garmentSeason: string | undefined | null,
    weather: WeatherCondition,
    _temperature?: number
  ): boolean {
    // No season info → assume all-season (includes newly-added Convex garments)
    if (!garmentSeason || garmentSeason === "all-season") return true;

    const weatherSeasonMap: Record<WeatherCondition, string[]> = {
      sunny: ["spring", "summer", "all-season"],
      cloudy: ["spring", "summer", "fall", "all-season"],
      rainy: ["spring", "fall", "winter", "all-season"],
      snowy: ["winter", "all-season"],
      foggy: ["spring", "fall", "winter", "all-season"],
      windy: ["fall", "winter", "all-season"],
      hot: ["summer", "all-season"],
      cold: ["winter", "all-season"],
    };

    return weatherSeasonMap[weather]?.includes(garmentSeason) ?? true;
  }

  /**
   * Check if garment is appropriate for temperature.
   * Garments with no material info are assumed suitable at any temperature —
   * we don't want to filter out the whole closet just because material is unset.
   */
  private static isTemperatureAppropriate(
    garment: Garment,
    temperature: number
  ): boolean {
    const material = garment.material?.toLowerCase() ?? "";
    const category = garment.category;

    // Hot weather (>25°C): skip heavy outerwear and known heavy materials
    if (temperature > 25) {
      if (
        category === "outerwear" ||
        (material && (material.includes("wool") || material.includes("fleece")))
      ) {
        return false;
      }
      return true;
    }

    // Cold weather (<10°C): prefer warm materials / outerwear, but only
    // exclude a garment if we *know* it has a summer-only material.
    if (temperature < 10) {
      const coldWeatherMaterials = ["wool", "fleece", "down", "synthetic"];
      // If material is known and warm, or it's outerwear → keep
      if (
        coldWeatherMaterials.some((m) => material.includes(m)) ||
        category === "outerwear"
      ) {
        return true;
      }
      // If material is known and explicitly summery → exclude
      const summerMaterials = ["linen", "silk", "rayon"];
      if (material && summerMaterials.some((m) => material.includes(m))) {
        return false;
      }
      // No material info → don't exclude (benefit of the doubt)
      return true;
    }

    // Mild weather (10–25°C): everything is fine
    return true;
  }

  /**
   * Generate outfit candidates by combining garments
   */
  private static generateCandidates(
    garments: Garment[],
    mood: Mood,
    preferences?: UserStylePreferences,
    recentGarmentIds?: string[]
  ): OutfitCandidate[] {
    const candidates: OutfitCandidate[] = [];

    // Group garments by category
    const categories = this.groupByCategory(garments);

    // Singular category keys matching the Convex schema
    const tops = categories.get("top") || [];
    const bottoms = categories.get("bottom") || [];
    const shoes = categories.get("shoes") || [];
    const accessories = categories.get("accessory") || [];

    if (tops.length === 0 || bottoms.length === 0) {
      return candidates; // Cannot create valid outfit
    }

    // Generate combinations
    for (const top of tops) {
      for (const bottom of bottoms) {
        // Try pairing with shoes (cap for combinatorial explosion)
        const shoesToTry: Array<
          Garment | { id: "barefoot"; category: "shoes" }
        > =
          shoes.length > 0
            ? shoes.slice(0, 4)
            : [{ id: "barefoot", category: "shoes" }];

        for (const shoe of shoesToTry) {
          const garmentIds = [top.id, bottom.id];
          const isBarefoot = shoe.id === "barefoot";
          if (!isBarefoot) {
            garmentIds.push(shoe.id);
          }

          const outfitPieces = isBarefoot
            ? [top, bottom]
            : [top, bottom, shoe as Garment];
          const { score, breakdown } = this.scoreOutfitWithBreakdown(
            outfitPieces,
            mood,
            preferences,
            recentGarmentIds
          );
          const reasons = this.generateReasons(outfitPieces, mood);

          candidates.push({
            garmentIds,
            score,
            reasons,
            scoreBreakdown: breakdown,
          });
        }

        // Add optional accessories; try multiple shoe pairings and keep best
        for (const accessory of accessories.slice(0, 2)) {
          let best: OutfitCandidate | null = null;

          for (const shoe of shoesToTry) {
            const isBarefoot = shoe.id === "barefoot";
            const outfitPieces = isBarefoot
              ? [top, bottom, accessory]
              : [top, bottom, shoe as Garment, accessory];
            const garmentIds = isBarefoot
              ? [top.id, bottom.id, accessory.id]
              : [top.id, bottom.id, (shoe as Garment).id, accessory.id];

            const { score, breakdown } = this.scoreOutfitWithBreakdown(
              outfitPieces,
              mood,
              preferences,
              recentGarmentIds
            );
            const reasons = this.generateReasons(outfitPieces, mood);

            const candidate: OutfitCandidate = {
              garmentIds,
              score,
              reasons,
              scoreBreakdown: breakdown,
            };

            if (!best || candidate.score > best.score) best = candidate;
          }

          if (best) candidates.push(best);
        }
      }
    }

    return candidates;
  }

  /**
   * Group garments by category
   */
  private static groupByCategory(
    garments: Garment[]
  ): Map<GarmentCategory, Garment[]> {
    const grouped = new Map<GarmentCategory, Garment[]>();

    for (const garment of garments) {
      if (!grouped.has(garment.category)) {
        grouped.set(garment.category, []);
      }
      grouped.get(garment.category)!.push(garment);
    }

    return grouped;
  }

  /**
   * Score an outfit and return per-category breakdown for explainability.
   */
  private static scoreOutfitWithBreakdown(
    garments: Garment[],
    mood: Mood,
    preferences?: UserStylePreferences,
    recentGarmentIds?: string[]
  ): { score: number; breakdown: ScoreBreakdown } {
    const base = 50;
    const colorHarmony = this.scoreColorHarmony(garments);
    const moodAlignment = this.scoreMoodAlignment(garments, mood);
    const styleCoherence = this.scoreStyleCoherence(garments);
    const occasionMatching = this.scoreOccasionMatching(garments, mood);
    const versatility = this.scoreVersatility(garments);
    const fit = this.scoreFitConsistency(garments);
    const vibrancy = this.scoreVibrancyHarmony(garments);
    const diversity = this.scoreDiversity(garments);
    const explicitScore = this.scoreExplicitPreferences(
      garments,
      preferences?.explicit
    );
    const learnedScore = this.scoreLearnedPreferences(
      garments,
      preferences?.learned
    );
    const preferencesTotal = explicitScore + learnedScore;

    const repetitionPenalty = this.scoreRepetitionPenalty(
      garments,
      recentGarmentIds
    );

    const score = Math.min(
      base +
        colorHarmony +
        moodAlignment +
        styleCoherence +
        occasionMatching +
        versatility +
        fit +
        vibrancy +
        diversity +
        preferencesTotal -
        repetitionPenalty,
      100
    );

    return {
      score,
      breakdown: {
        base,
        colorHarmony,
        moodAlignment,
        styleCoherence,
        occasionMatching,
        versatility,
        fit,
        vibrancy,
        diversity,
        preferences: preferencesTotal,
        repetitionPenalty,
      },
    };
  }

  /**
   * Score an outfit based on color harmony, mood fit, and diversity
   */
  private static scoreOutfit(
    garments: Garment[],
    mood: Mood,
    preferences?: UserStylePreferences
  ): number {
    return this.scoreOutfitWithBreakdown(garments, mood, preferences).score;
  }

  /**
   * Penalize repeating recently-used pieces to increase variety across generations.
   * Returns a positive number representing how many points to subtract.
   */
  private static scoreRepetitionPenalty(
    garments: Garment[],
    recentGarmentIds?: string[]
  ): number {
    if (!recentGarmentIds || recentGarmentIds.length === 0) return 0;
    const recent = new Set(recentGarmentIds);
    const repeats = garments.filter((g) => recent.has(g.id)).length;
    // 0 repeats -> 0, 1 repeat -> 2, 2 repeats -> 4, cap at 10
    return Math.min(repeats * 2, 10);
  }

  /**
   * Score fit consistency - outfits feel better when fits don't clash.
   */
  private static scoreFitConsistency(garments: Garment[]): number {
    const fits = garments
      .map((g) => g.fit?.toLowerCase())
      .filter((f): f is string => Boolean(f));
    if (fits.length === 0) return 0;
    const unique = new Set(fits);
    if (unique.size === 1) return 8;
    // A little mix is fine; too many different fits feels random
    if (unique.size === 2) return 4;
    return 0;
  }

  /**
   * Score vibrancy harmony - keep outfit energy consistent (muted/balanced/vibrant).
   */
  private static scoreVibrancyHarmony(garments: Garment[]): number {
    const vib = garments
      .map((g) => g.vibrancy)
      .filter((v): v is NonNullable<Garment["vibrancy"]> => Boolean(v));
    if (vib.length === 0) return 0;
    const unique = new Set(vib);
    if (unique.size === 1) return 8;
    if (unique.size === 2) return 4;
    return 0;
  }

  /**
   * De-dupe candidates by garment set; keep the highest-score version.
   */
  private static dedupeCandidates(
    candidates: OutfitCandidate[]
  ): OutfitCandidate[] {
    const bestByKey = new Map<string, OutfitCandidate>();
    for (const c of candidates) {
      const key = [...c.garmentIds].sort().join("|");
      const existing = bestByKey.get(key);
      if (!existing || c.score > existing.score) {
        bestByKey.set(key, c);
      }
    }
    return Array.from(bestByKey.values());
  }

  /**
   * Score how well an outfit matches the user's explicit style preferences
   * from their profile (stronger authority, includes avoids).
   */
  private static scoreExplicitPreferences(
    garments: Garment[],
    preferences?: UserStylePreferences["explicit"] | null
  ): number {
    if (!preferences) return 0;

    let score = 0;

    const preferredStyles =
      preferences.preferredStyles?.map((s) => s.toLowerCase()) ?? [];
    const preferredColors =
      preferences.preferredColors?.map((c) => c.toLowerCase()) ?? [];
    const avoidedColors =
      preferences.avoidedColors?.map((c) => c.toLowerCase()) ?? [];

    for (const garment of garments) {
      const garmentStyles = (garment.style ?? []).map((s) => s.toLowerCase());
      const garmentColor = garment.primaryColor.toLowerCase();

      // Reward preferred styles
      if (preferredStyles.length > 0) {
        const styleMatches = garmentStyles.filter((s) =>
          preferredStyles.includes(s)
        ).length;
        score += styleMatches * 2;
      }

      // Reward preferred colors
      if (
        preferredColors.length > 0 &&
        preferredColors.includes(garmentColor)
      ) {
        score += 2;
      }

      // Penalize avoided colors a bit more strongly
      if (avoidedColors.length > 0 && avoidedColors.includes(garmentColor)) {
        score -= 4;
      }
    }

    // Keep influence modest but allow both positive and negative swings
    return Math.max(-10, Math.min(score, 15));
  }

  /**
   * Score how well an outfit matches the user's learned preferences from
   * behavior (saved outfits). No "avoid" concept here, just gentle nudging.
   */
  private static scoreLearnedPreferences(
    garments: Garment[],
    preferences?: UserStylePreferences["learned"]
  ): number {
    if (!preferences) return 0;

    let score = 0;

    const preferredStyles =
      preferences.preferredStyles?.map((s) => s.toLowerCase()) ?? [];
    const preferredColors =
      preferences.preferredColors?.map((c) => c.toLowerCase()) ?? [];

    for (const garment of garments) {
      const garmentStyles = (garment.style ?? []).map((s) => s.toLowerCase());
      const garmentColor = garment.primaryColor.toLowerCase();

      // Reward learned preferred styles (slightly lighter weight)
      if (preferredStyles.length > 0) {
        const styleMatches = garmentStyles.filter((s) =>
          preferredStyles.includes(s)
        ).length;
        score += styleMatches * 1.5;
      }

      // Reward learned preferred colors
      if (
        preferredColors.length > 0 &&
        preferredColors.includes(garmentColor)
      ) {
        score += 1.5;
      }
    }

    // Learned preferences are softer influence
    return Math.max(0, Math.min(score, 10));
  }

  /**
   * Score style coherence - how well garment styles match each other.
   * Prefers the dedicated `style` array field; falls back to tag scanning.
   */
  private static scoreStyleCoherence(garments: Garment[]): number {
    if (garments.length < 2) return 0;

    const styleKeywords = [
      "minimalist",
      "bold",
      "classic",
      "trendy",
      "avant-garde",
      "casual",
    ];

    const extractStyles = (g: Garment): string[] => {
      // Prefer the dedicated `style` field (Convex schema)
      if (g.style && g.style.length > 0)
        return g.style.map((s) => s.toLowerCase());
      // Fall back to scanning tags for style keywords
      return g.tags.filter((tag) =>
        styleKeywords.some((keyword) => tag.toLowerCase().includes(keyword))
      );
    };

    const allStyles = garments.flatMap(extractStyles);

    if (allStyles.length === 0) return 5;

    // Bonus for garments sharing at least one style
    const styleMatches = allStyles.filter((style, index) =>
      allStyles.slice(index + 1).includes(style)
    );

    if (styleMatches.length > 0) return 15;

    const hasMinimalist = allStyles.some((s) => s.includes("minimalist"));
    const hasBold = allStyles.some((s) => s.includes("bold"));
    const hasClassic = allStyles.some((s) => s.includes("classic"));

    if ((hasMinimalist && hasClassic) || (hasBold && hasClassic)) return 10;

    return 5;
  }

  /**
   * Score occasion matching - ensures outfit is appropriate for the mood context.
   * Prefers the dedicated `occasion` array field; falls back to tag scanning.
   */
  private static scoreOccasionMatching(
    garments: Garment[],
    mood: Mood
  ): number {
    const moodToOccasion: Record<Mood, string[]> = {
      casual: ["casual", "weekend"],
      formal: ["formal", "work", "night"],
      adventurous: ["weekend", "casual"],
      cozy: ["casual", "weekend"],
      energetic: ["casual", "work"],
      minimalist: ["work", "smart-casual", "formal"],
      bold: ["night", "weekend", "casual"],
    };

    const targetOccasions = moodToOccasion[mood] || [];
    if (targetOccasions.length === 0) return 0;

    const knownOccasions = [
      "casual",
      "formal",
      "work",
      "smart-casual",
      "night",
      "weekend",
    ];

    let matchScore = 0;
    for (const garment of garments) {
      // Prefer the dedicated `occasion` field (Convex schema)
      const garmentOccasions: string[] =
        garment.occasion && garment.occasion.length > 0
          ? garment.occasion.map((o) => o.toLowerCase())
          : garment.tags.filter((tag) =>
              knownOccasions.includes(tag.toLowerCase())
            );

      const matches = garmentOccasions.filter((occ) =>
        targetOccasions.includes(occ)
      ).length;

      matchScore += matches * 2;
    }

    return Math.min(matchScore, 12);
  }

  /**
   * Score versatility - prefer outfits with versatile pieces.
   * Uses the dedicated `versatility` field first; falls back to tags.
   */
  private static scoreVersatility(garments: Garment[]): number {
    let versatilityScore = 0;

    for (const garment of garments) {
      if (
        garment.versatility === "high" ||
        garment.tags.includes("versatile-high")
      ) {
        versatilityScore += 2;
      } else if (
        garment.versatility === "medium" ||
        garment.tags.includes("versatile-medium")
      ) {
        versatilityScore += 1;
      }
    }

    return Math.min(versatilityScore, 8);
  }

  /**
   * Score color harmony of an outfit
   */
  private static scoreColorHarmony(garments: Garment[]): number {
    if (garments.length < 2) return 0;

    const colors = garments.map((g) => g.primaryColor.toLowerCase());

    // Complementary colors
    const complementaryPairs = [
      ["blue", "orange"],
      ["red", "green"],
      ["yellow", "purple"],
    ];

    let harmonyScore = 0;

    for (const [color1, color2] of complementaryPairs) {
      if (colors.includes(color1) && colors.includes(color2)) {
        harmonyScore += 15;
      }
    }

    // Same color bonus (monochromatic)
    if (colors.every((c) => c === colors[0])) {
      harmonyScore += 10;
    }

    // Neutral colors are generally safe
    const neutrals = ["black", "white", "gray", "beige", "navy"];
    const neutralCount = colors.filter((c) => neutrals.includes(c)).length;
    if (neutralCount >= colors.length - 1) {
      harmonyScore += 8;
    }

    return Math.min(harmonyScore, 20);
  }

  /**
   * Score mood alignment
   */
  private static scoreMoodAlignment(garments: Garment[], mood: Mood): number {
    let score = 0;

    const moodTags: Record<Mood, string[]> = {
      casual: ["cotton", "denim", "relaxed"],
      formal: ["silk", "wool", "structured"],
      adventurous: ["bold", "colorful", "unique"],
      cozy: ["fleece", "warm", "soft"],
      energetic: ["bright", "bold", "dynamic"],
      minimalist: ["neutral", "simple", "clean"],
      bold: ["vibrant", "statement", "eye-catching"],
    };

    const targetTags = moodTags[mood] || [];

    for (const garment of garments) {
      const garmentTags = [
        garment.material?.toLowerCase() || "",
        ...garment.tags.map((t) => t.toLowerCase()),
      ];

      const matches = garmentTags.filter((t) =>
        targetTags.some((target) => t.includes(target))
      ).length;

      score += matches * 3;
    }

    return Math.min(score, 20);
  }

  /**
   * Score outfit diversity (prefer variety in pieces)
   */
  private static scoreDiversity(garments: Garment[]): number {
    // Prefer outfits with 3+ pieces
    return garments.length >= 3 ? 10 : 5;
  }

  /**
   * Generate human-readable reasons for the outfit
   */
  private static generateReasons(garments: Garment[], mood: Mood): string[] {
    const reasons: string[] = [];

    if (garments.length >= 3) {
      reasons.push(`Well-balanced outfit with ${garments.length} pieces`);
    }

    // Color reasoning
    const hasNeutral = garments.some((g) =>
      ["black", "white", "gray", "navy", "beige"].includes(
        g.primaryColor.toLowerCase()
      )
    );
    if (hasNeutral) {
      reasons.push("Neutral base for easy coordination");
    }

    // Style coherence reasoning (use `style` field, fall back to tags)
    const styleKeywords = [
      "minimalist",
      "bold",
      "classic",
      "trendy",
      "avant-garde",
    ];
    const allStyles = garments.flatMap((g) =>
      g.style && g.style.length > 0
        ? g.style.map((s) => s.toLowerCase())
        : g.tags.filter((t) => styleKeywords.includes(t.toLowerCase()))
    );
    const uniqueStyles = [...new Set(allStyles)];

    if (uniqueStyles.length === 1) {
      reasons.push(`Cohesive ${uniqueStyles[0]} aesthetic`);
    } else if (
      uniqueStyles.includes("classic") &&
      (uniqueStyles.includes("bold") || uniqueStyles.includes("minimalist"))
    ) {
      reasons.push("Classic foundation with modern twist");
    }

    // Occasion reasoning (use `occasion` field, fall back to tags)
    const knownOccasions = [
      "casual",
      "formal",
      "work",
      "smart-casual",
      "night",
      "weekend",
    ];
    const allOccasions = garments.flatMap((g) =>
      g.occasion && g.occasion.length > 0
        ? g.occasion.map((o) => o.toLowerCase())
        : g.tags.filter((t) => knownOccasions.includes(t.toLowerCase()))
    );
    const commonOccasions = [...new Set(allOccasions)];

    if (commonOccasions.includes("formal")) {
      reasons.push("Polished and put-together");
    } else if (commonOccasions.includes("casual")) {
      reasons.push("Comfortable and approachable");
    }

    // Versatility reasoning (use `versatility` field, fall back to tags)
    const versatilePieces = garments.filter(
      (g) => g.versatility === "high" || g.tags.includes("versatile-high")
    ).length;
    if (versatilePieces >= 2) {
      reasons.push("Mix-and-match friendly pieces");
    }

    // Mood description
    const moodDescriptions: Record<Mood, string> = {
      casual: "Perfect for a relaxed day",
      formal: "Polished and professional",
      adventurous: "Ready for an adventure",
      cozy: "Comfortable and warm",
      energetic: "Energizing and uplifting",
      minimalist: "Clean and simple",
      bold: "Statement-making outfit",
    };

    reasons.push(moodDescriptions[mood] || "Well-coordinated look");

    return reasons;
  }

  /**
   * Generate overall explanation for recommendations
   */
  private static generateExplanation(input: RecommendationInput): string {
    const parts: string[] = [];

    if (input.weather) {
      parts.push(`Recommended for ${input.weather} weather`);
    }

    if (input.mood) {
      parts.push(`with a ${input.mood} vibe`);
    }

    if (input.temperature !== undefined) {
      parts.push(`(${input.temperature}°C)`);
    }

    if (parts.length === 0) {
      return "Outfit recommendations based on your wardrobe.";
    }

    return (
      "Outfit recommendations " +
      parts.join(" ") +
      ". Mix and match pieces or shuffle for more options."
    );
  }
}
