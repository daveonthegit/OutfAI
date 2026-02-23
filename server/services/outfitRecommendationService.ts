import {
  Garment,
  Outfit,
  RecommendationInput,
  RecommendationOutput,
  Mood,
  WeatherCondition,
  GarmentCategory,
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
 * - Total Range: 50-100 points
 * - Minimum Threshold: 60 points (must pass to be recommended)
 *
 * Outfits are ranked by score and up to 6 passing suggestions are returned.
 * If fewer than 6 outfits meet the 60-point threshold, only those are returned.
 */

interface OutfitCandidate {
  garmentIds: string[];
  score: number;
  reasons: string[];
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
      return {
        outfits: [],
        explanation: "No garments found in wardrobe. Please add items first.",
        totalGenerated: 0,
      };
    }

    // Filter garments based on constraints
    const filteredGarments = this.filterByContext(garments, input);

    if (filteredGarments.length === 0) {
      return {
        outfits: [],
        explanation:
          "No suitable outfits found for the current weather and mood combination.",
        totalGenerated: 0,
      };
    }

    // Generate candidate outfits
    const candidates = this.generateCandidates(
      filteredGarments,
      input.mood || "casual"
    );

    // Minimum score threshold - outfits must meet this quality bar
    const MIN_SCORE_THRESHOLD = 60;

    // Score and rank candidates, filter by minimum score
    const rankedCandidates = candidates
      .sort((a, b) => b.score - a.score)
      .filter((candidate) => candidate.score >= MIN_SCORE_THRESHOLD)
      .slice(0, input.limitCount || 6);

    // If no outfits meet the threshold, return empty with explanation
    if (rankedCandidates.length === 0) {
      return {
        outfits: [],
        explanation:
          "No high-quality outfit combinations found. Try adjusting your mood, weather, or add more items to your closet.",
        totalGenerated: 0,
      };
    }

    // Convert to outfit objects
    const outfits = rankedCandidates.map((candidate, index) => ({
      id: `outfit-${Date.now()}-${index}`,
      userId: input.userId,
      garmentIds: candidate.garmentIds,
      contextWeather: input.weather,
      contextMood: input.mood,
      explanation: candidate.reasons.join(" • "),
      score: candidate.score,
      createdAt: new Date(),
    }));

    return {
      outfits,
      explanation: this.generateExplanation(input),
      totalGenerated: outfits.length,
    };
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
   * Check if garment season is appropriate for weather
   */
  private static isSeasonAppropriate(
    garmentSeason: string,
    weather: WeatherCondition,
    temperature?: number
  ): boolean {
    if (garmentSeason === "all-season") return true;

    const weatherSeasonMap: Record<WeatherCondition, string[]> = {
      sunny: ["spring", "summer", "all-season"],
      cloudy: ["spring", "summer", "fall", "all-season"],
      rainy: ["spring", "fall", "winter", "all-season"],
      snowy: ["winter", "all-season"],
      windy: ["fall", "winter", "all-season"],
      hot: ["summer", "all-season"],
      cold: ["winter", "all-season"],
    };

    return weatherSeasonMap[weather]?.includes(garmentSeason) || false;
  }

  /**
   * Check if garment is appropriate for temperature
   */
  private static isTemperatureAppropriate(
    garment: Garment,
    temperature: number
  ): boolean {
    const material = garment.material?.toLowerCase() || "";
    const category = garment.category;

    // Hot weather (>25°C)
    if (temperature > 25) {
      const hotWeatherMaterials = [
        "cotton",
        "linen",
        "silk",
        "rayon",
        "polyester",
      ];
      if (
        category === "outerwear" ||
        material.includes("wool") ||
        material.includes("fleece")
      ) {
        return false;
      }
      return true;
    }

    // Cold weather (<10°C)
    if (temperature < 10) {
      const coldWeatherMaterials = ["wool", "fleece", "down", "synthetic"];
      const isColdAppropriate =
        coldWeatherMaterials.some((m) => material.includes(m)) ||
        category === "outerwear";
      return isColdAppropriate;
    }

    // Mild weather
    return true;
  }

  /**
   * Generate outfit candidates by combining garments
   */
  private static generateCandidates(
    garments: Garment[],
    mood: Mood
  ): OutfitCandidate[] {
    const candidates: OutfitCandidate[] = [];

    // Group garments by category
    const categories = this.groupByCategory(garments);

    // Ensure we have at least one top and bottom
    const tops = categories.get("tops") || [];
    const bottoms = categories.get("bottoms") || [];
    const shoes = categories.get("shoes") || [];

    if (tops.length === 0 || bottoms.length === 0) {
      return candidates; // Cannot create valid outfit
    }

    // Generate combinations
    for (const top of tops) {
      for (const bottom of bottoms) {
        // Try pairing with shoes
        const shoesToTry =
          shoes.length > 0 ? shoes : [{ id: "barefoot", category: "shoes" }];

        for (const shoe of shoesToTry) {
          const garmentIds = [top.id, bottom.id];
          const isBarefoot = shoe.id === "barefoot";
          if (!isBarefoot) {
            garmentIds.push(shoe.id);
          }

          const outfitPieces = isBarefoot
            ? [top, bottom]
            : [top, bottom, shoe as Garment];
          const score = this.scoreOutfit(outfitPieces, mood, garments);
          const reasons = this.generateReasons(outfitPieces, mood);

          candidates.push({
            garmentIds,
            score,
            reasons,
          });
        }

        // Add optional accessories
        const accessories = categories.get("accessories") || [];
        for (const accessory of accessories.slice(0, 2)) {
          const garmentIds = [top.id, bottom.id];
          if (shoes.length > 0) {
            garmentIds.push(shoes[0].id);
          }
          garmentIds.push(accessory.id);

          const score = this.scoreOutfit(
            [top, bottom, ...shoes.slice(0, 1), accessory],
            mood,
            garments
          );
          const reasons = this.generateReasons(
            [top, bottom, ...shoes.slice(0, 1), accessory],
            mood
          );

          candidates.push({
            garmentIds,
            score,
            reasons,
          });
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
   * Score an outfit based on color harmony, mood fit, and diversity
   */
  private static scoreOutfit(
    garments: Garment[],
    mood: Mood,
    allGarments: Garment[]
  ): number {
    let score = 0;

    // Base score
    score += 50;

    // Color harmony bonus
    const colorScore = this.scoreColorHarmony(garments);
    score += colorScore;

    // Mood alignment bonus
    const moodScore = this.scoreMoodAlignment(garments, mood);
    score += moodScore;

    // Style coherence bonus (new)
    const styleScore = this.scoreStyleCoherence(garments);
    score += styleScore;

    // Occasion matching bonus (new)
    const occasionScore = this.scoreOccasionMatching(garments, mood);
    score += occasionScore;

    // Versatility bonus (new)
    const versatilityScore = this.scoreVersatility(garments);
    score += versatilityScore;

    // Diversity bonus (prefer mixing different items)
    const diversityScore = this.scoreDiversity(garments);
    score += diversityScore;

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Score style coherence - how well garment styles match each other
   */
  private static scoreStyleCoherence(garments: Garment[]): number {
    if (garments.length < 2) return 0;

    const extractStyles = (tags: string[]): string[] => {
      const styleKeywords = [
        "minimalist",
        "bold",
        "classic",
        "trendy",
        "avant-garde",
        "casual",
      ];
      return tags.filter((tag) =>
        styleKeywords.some((keyword) => tag.includes(keyword))
      );
    };

    const allStyles = garments.flatMap((g) => extractStyles(g.tags));

    if (allStyles.length === 0) return 5; // Neutral score if no style tags

    // Check if garments share at least one style
    const styleMatches = allStyles.filter((style, index) =>
      allStyles.slice(index + 1).includes(style)
    );

    if (styleMatches.length > 0) {
      return 15; // Strong bonus for matching styles
    }

    // Bonus if garments have complementary styles
    const hasMinimalist = allStyles.some((s) => s.includes("minimalist"));
    const hasBold = allStyles.some((s) => s.includes("bold"));
    const hasClassic = allStyles.some((s) => s.includes("classic"));

    if ((hasMinimalist && hasClassic) || (hasBold && hasClassic)) {
      return 10; // Complementary style combo
    }

    return 5; // Baseline
  }

  /**
   * Score occasion matching - ensures outfit is appropriate for contexts
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

    let matchScore = 0;
    for (const garment of garments) {
      const garmentOccasions = garment.tags.filter((tag) =>
        [
          "casual",
          "formal",
          "work",
          "smart-casual",
          "night",
          "weekend",
        ].includes(tag)
      );

      const matches = garmentOccasions.filter((occ) =>
        targetOccasions.includes(occ)
      ).length;

      matchScore += matches * 2;
    }

    return Math.min(matchScore, 12);
  }

  /**
   * Score versatility - prefer outfits with versatile pieces
   */
  private static scoreVersatility(garments: Garment[]): number {
    let versatilityScore = 0;

    for (const garment of garments) {
      if (garment.tags.includes("versatile-high")) {
        versatilityScore += 2;
      } else if (garment.tags.includes("versatile-medium")) {
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

    // Style coherence reasoning
    const allStyles = garments.flatMap((g) =>
      g.tags.filter((t) =>
        ["minimalist", "bold", "classic", "trendy", "avant-garde"].includes(t)
      )
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

    // Occasion reasoning
    const allOccasions = garments.flatMap((g) =>
      g.tags.filter((t) =>
        [
          "casual",
          "formal",
          "work",
          "smart-casual",
          "night",
          "weekend",
        ].includes(t)
      )
    );
    const commonOccasions = [...new Set(allOccasions)];

    if (commonOccasions.includes("formal")) {
      reasons.push("Polished and put-together");
    } else if (commonOccasions.includes("casual")) {
      reasons.push("Comfortable and approachable");
    }

    // Versatility reasoning
    const versatilePieces = garments.filter((g) =>
      g.tags.includes("versatile-high")
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
