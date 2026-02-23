import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { OutfitRecommendationService } from "../../services/outfitRecommendationService";
import {
  Mood,
  WeatherCondition,
  Garment,
  RecommendationInput,
} from "../../../shared/types";

/**
 * Recommendation Router
 *
 * tRPC endpoints for outfit recommendations.
 * In a real implementation, this would fetch garments from the database.
 */

// Mock garment data for demonstration
const MOCK_GARMENTS: Garment[] = [
  {
    id: "g1",
    userId: "user1",
    name: "Blue Linen Shirt",
    category: "tops",
    primaryColor: "blue",
    material: "linen",
    season: "summer",
    tags: ["casual", "breathable"],
    createdAt: new Date(),
  },
  {
    id: "g2",
    userId: "user1",
    name: "Black Skinny Jeans",
    category: "bottoms",
    primaryColor: "black",
    material: "denim",
    season: "all-season",
    tags: ["versatile", "classic"],
    createdAt: new Date(),
  },
  {
    id: "g3",
    userId: "user1",
    name: "White Sneakers",
    category: "shoes",
    primaryColor: "white",
    material: "canvas",
    season: "all-season",
    tags: ["casual", "comfortable"],
    createdAt: new Date(),
  },
  {
    id: "g4",
    userId: "user1",
    name: "Wool Sweater",
    category: "tops",
    primaryColor: "gray",
    material: "wool",
    season: "winter",
    tags: ["warm", "cozy"],
    createdAt: new Date(),
  },
  {
    id: "g5",
    userId: "user1",
    name: "Khaki Chinos",
    category: "bottoms",
    primaryColor: "beige",
    material: "cotton",
    season: "spring",
    tags: ["versatile", "professional"],
    createdAt: new Date(),
  },
  {
    id: "g6",
    userId: "user1",
    name: "Leather Jacket",
    category: "outerwear",
    primaryColor: "black",
    material: "leather",
    season: "fall",
    tags: ["bold", "statement"],
    createdAt: new Date(),
  },
  {
    id: "g7",
    userId: "user1",
    name: "Cotton T-Shirt",
    category: "tops",
    primaryColor: "white",
    material: "cotton",
    season: "summer",
    tags: ["basic", "comfortable"],
    createdAt: new Date(),
  },
  {
    id: "g8",
    userId: "user1",
    name: "Gold Necklace",
    category: "accessories",
    primaryColor: "gold",
    material: "metal",
    season: "all-season",
    tags: ["statement", "elegant"],
    createdAt: new Date(),
  },
];

export const recommendationRouter = router({
  /**
   * Generate outfit recommendations
   * POST /api/recommendations.generate
   *
   * Input:
   *   - userId: string (required)
   *   - mood?: Mood (optional)
   *   - weather?: WeatherCondition (optional)
   *   - temperature?: number (optional, in Celsius)
   *   - occasion?: string (optional)
   *   - limitCount?: number (optional, default: 5)
   *
   * Output:
   *   - outfits: array of Outfit objects
   *   - explanation: string
   *   - totalGenerated: number
   */
  generate: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        mood: z
          .enum([
            "casual",
            "formal",
            "adventurous",
            "cozy",
            "energetic",
            "minimalist",
            "bold",
          ] as const)
          .optional(),
        weather: z
          .enum([
            "sunny",
            "cloudy",
            "rainy",
            "snowy",
            "windy",
            "hot",
            "cold",
          ] as const)
          .optional(),
        temperature: z.number().min(-50).max(50).optional(),
        occasion: z.string().optional(),
        limitCount: z.number().min(1).max(10).default(5),
        garments: z
          .array(
            z.object({
              id: z.string(),
              userId: z.string(),
              name: z.string(),
              category: z.enum([
                "tops",
                "bottoms",
                "shoes",
                "outerwear",
                "accessories",
              ]),
              primaryColor: z.string(),
              secondaryColor: z.string().optional(),
              material: z.string().optional(),
              season: z.enum([
                "spring",
                "summer",
                "fall",
                "winter",
                "all-season",
              ]),
              imageUrl: z.string().optional(),
              tags: z.array(z.string()),
              createdAt: z.date().or(z.string()),
            })
          )
          .optional(),
      })
    )
    .query(async ({ input }) => {
      // Use provided garments or fall back to mock data
      const garments = input.garments
        ? (input.garments as Garment[]).map((g) => ({
            ...g,
            createdAt:
              g.createdAt instanceof Date ? g.createdAt : new Date(g.createdAt),
          }))
        : MOCK_GARMENTS.filter((g) => g.userId === input.userId);

      const recommendationInput: RecommendationInput = {
        userId: input.userId,
        mood: input.mood,
        weather: input.weather,
        temperature: input.temperature,
        occasion: input.occasion,
        limitCount: input.limitCount,
      };

      const result = await OutfitRecommendationService.generateOutfits(
        garments,
        recommendationInput
      );

      return result;
    }),

  /**
   * Get a single outfit by ID (with expanded garment details)
   * POST /api/recommendations.getOutfit
   */
  getOutfit: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        outfitId: z.string(),
      })
    )
    .query(async ({ input }) => {
      // TODO: In production, fetch from database
      // For now, return a placeholder
      return {
        id: input.outfitId,
        userId: input.userId,
        garmentIds: ["g1", "g2", "g3"],
        garments: MOCK_GARMENTS.filter((g) =>
          ["g1", "g2", "g3"].includes(g.id)
        ),
        explanation: "Well-coordinated casual outfit",
        score: 85,
        createdAt: new Date(),
      };
    }),

  /**
   * Log user interaction with a recommendation
   * POST /api/recommendations.logInteraction
   */
  logInteraction: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        outfitId: z.string(),
        action: z.enum(["shown", "saved", "skipped", "worn"]),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: In production, save to recommendation_logs table
      // await db.recommendationLog.create({
      //   data: {
      //     userId: input.userId,
      //     outfitId: input.outfitId,
      //     action: input.action,
      //     timestamp: new Date()
      //   }
      // });

      return {
        success: true,
        message: `Logged ${input.action} action for outfit ${input.outfitId}`,
      };
    }),

  /**
   * Get mock garments (for testing UI without database)
   * DELETE THIS in production
   */
  getMockGarments: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return MOCK_GARMENTS.filter((g) => g.userId === input.userId);
    }),
});
