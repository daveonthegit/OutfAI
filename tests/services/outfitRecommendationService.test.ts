import { describe, it, expect } from "vitest";
import { OutfitRecommendationService } from "../../server/services/outfitRecommendationService";
import type { Garment } from "../../shared/types";

function makeGarment(
  overrides: Partial<Garment> & Pick<Garment, "id" | "category">
): Garment {
  return {
    userId: "test-user",
    name: `Test ${overrides.category}`,
    primaryColor: "black",
    season: "all-season",
    tags: [],
    createdAt: new Date(),
    ...overrides,
  };
}

const WARDROBE: Garment[] = [
  makeGarment({
    id: "top-1",
    name: "White Cotton T-Shirt",
    category: "tops",
    primaryColor: "white",
    material: "cotton",
    season: "summer",
    tags: ["casual", "basic"],
  }),
  makeGarment({
    id: "top-2",
    name: "Blue Dress Shirt",
    category: "tops",
    primaryColor: "blue",
    material: "cotton",
    season: "all-season",
    tags: ["formal"],
  }),
  makeGarment({
    id: "top-3",
    name: "Wool Sweater",
    category: "tops",
    primaryColor: "navy",
    material: "wool",
    season: "winter",
    tags: ["warm", "cozy"],
  }),
  makeGarment({
    id: "bottom-1",
    name: "Black Jeans",
    category: "bottoms",
    primaryColor: "black",
    material: "denim",
    season: "all-season",
    tags: ["casual"],
  }),
  makeGarment({
    id: "bottom-2",
    name: "Khaki Chinos",
    category: "bottoms",
    primaryColor: "beige",
    material: "cotton",
    season: "all-season",
    tags: ["smart-casual"],
  }),
  makeGarment({
    id: "bottom-3",
    name: "Wool Trousers",
    category: "bottoms",
    primaryColor: "gray",
    material: "wool",
    season: "winter",
    tags: ["formal", "warm"],
  }),
  makeGarment({
    id: "shoes-1",
    name: "White Sneakers",
    category: "shoes",
    primaryColor: "white",
    material: "leather",
    season: "all-season",
    tags: ["casual"],
  }),
  makeGarment({
    id: "outer-1",
    name: "Wool Coat",
    category: "outerwear",
    primaryColor: "gray",
    material: "wool",
    season: "winter",
    tags: ["formal", "warm"],
  }),
];

describe("OutfitRecommendationService", () => {
  describe("generateOutfits", () => {
    it("returns empty result when garments list is empty", async () => {
      const result = await OutfitRecommendationService.generateOutfits([], {
        userId: "user-1",
        mood: "casual",
      });
      expect(result.outfits).toHaveLength(0);
      expect(result.totalGenerated).toBe(0);
      expect(result.explanation).toContain("No garments");
    });

    it("generates outfits with valid structure", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        { userId: "user-1", mood: "casual" }
      );
      expect(result.outfits.length).toBeGreaterThan(0);
      expect(result.totalGenerated).toBe(result.outfits.length);

      for (const outfit of result.outfits) {
        expect(outfit.id).toBeTruthy();
        expect(outfit.userId).toBe("user-1");
        expect(outfit.garmentIds.length).toBeGreaterThanOrEqual(2);
        expect(outfit.score).toBeGreaterThanOrEqual(0);
        expect(outfit.score).toBeLessThanOrEqual(100);
        expect(outfit.createdAt).toBeInstanceOf(Date);
      }
    });

    it("every outfit contains at least one top and one bottom", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        { userId: "user-1", mood: "casual" }
      );

      const topIds = new Set(
        WARDROBE.filter((g) => g.category === "tops").map((g) => g.id)
      );
      const bottomIds = new Set(
        WARDROBE.filter((g) => g.category === "bottoms").map((g) => g.id)
      );

      for (const outfit of result.outfits) {
        const hasTop = outfit.garmentIds.some((id) => topIds.has(id));
        const hasBottom = outfit.garmentIds.some((id) => bottomIds.has(id));
        expect(hasTop).toBe(true);
        expect(hasBottom).toBe(true);
      }
    });

    it("returns empty when only tops exist (no bottoms)", async () => {
      const topsOnly = WARDROBE.filter((g) => g.category === "tops");
      const result = await OutfitRecommendationService.generateOutfits(
        topsOnly,
        { userId: "user-1", mood: "casual" }
      );
      expect(result.outfits).toHaveLength(0);
    });

    it("returns empty when only bottoms exist (no tops)", async () => {
      const bottomsOnly = WARDROBE.filter((g) => g.category === "bottoms");
      const result = await OutfitRecommendationService.generateOutfits(
        bottomsOnly,
        { userId: "user-1", mood: "casual" }
      );
      expect(result.outfits).toHaveLength(0);
    });

    it("respects limitCount parameter", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        { userId: "user-1", mood: "casual", limitCount: 2 }
      );
      expect(result.outfits.length).toBeLessThanOrEqual(2);
    });

    it("outfits are sorted by score descending", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        { userId: "user-1", mood: "casual", limitCount: 10 }
      );
      for (let i = 1; i < result.outfits.length; i++) {
        expect(result.outfits[i - 1].score).toBeGreaterThanOrEqual(
          result.outfits[i].score
        );
      }
    });

    it("generates context-aware explanation", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        {
          userId: "user-1",
          mood: "casual",
          weather: "sunny",
          temperature: 22,
        }
      );
      expect(result.explanation).toBeTruthy();
      expect(result.explanation).toContain("sunny");
      expect(result.explanation).toContain("casual");
    });

    it("filters out summer items in cold weather", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        { userId: "user-1", mood: "cozy", weather: "cold", temperature: 5 }
      );
      for (const outfit of result.outfits) {
        expect(outfit.garmentIds).not.toContain("top-1");
      }
    });

    it("returns winter-appropriate outfits for cold weather", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        { userId: "user-1", mood: "cozy", weather: "cold", temperature: 5 }
      );
      expect(result.outfits.length).toBeGreaterThan(0);
      for (const outfit of result.outfits) {
        const garments = outfit.garmentIds.map((id) =>
          WARDROBE.find((g) => g.id === id)
        );
        for (const g of garments) {
          if (g) {
            expect(["winter", "all-season"]).toContain(g.season);
          }
        }
      }
    });

    it("filters heavy items in hot weather", async () => {
      const result = await OutfitRecommendationService.generateOutfits(
        WARDROBE,
        { userId: "user-1", mood: "casual", weather: "hot", temperature: 30 }
      );
      for (const outfit of result.outfits) {
        expect(outfit.garmentIds).not.toContain("outer-1");
        expect(outfit.garmentIds).not.toContain("top-3");
      }
    });
  });
});
