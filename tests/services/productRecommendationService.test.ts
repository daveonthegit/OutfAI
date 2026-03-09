import { describe, it, expect } from "vitest";
import { ProductRecommendationService } from "../../server/services/productRecommendationService";
import type { Garment, ExternalProduct } from "../../shared/types";

function makeGarment(
  overrides: Partial<Garment> & Pick<Garment, "id" | "category">
): Garment {
  return {
    userId: "user-1",
    name: "Item",
    primaryColor: "black",
    tags: [],
    createdAt: new Date(),
    ...overrides,
  };
}

function makeProduct(
  overrides: Partial<ExternalProduct> &
    Pick<ExternalProduct, "id" | "name" | "category" | "productUrl">
): ExternalProduct {
  const now = Date.now();
  return {
    source: "mock",
    sourceProductId: String(overrides.id),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const GARMENTS: Garment[] = [
  makeGarment({
    id: "g1",
    name: "White Tee",
    category: "top",
    primaryColor: "white",
  }),
  makeGarment({
    id: "g2",
    name: "Black Jeans",
    category: "bottom",
    primaryColor: "black",
  }),
  makeGarment({
    id: "g3",
    name: "Navy Blazer",
    category: "outerwear",
    primaryColor: "navy",
  }),
];

describe("ProductRecommendationService", () => {
  describe("recommend", () => {
    it("returns empty when no garments", () => {
      const products = [
        makeProduct({
          id: "p1",
          name: "Shoes",
          category: "shoes",
          productUrl: "https://x.com/1",
        }),
      ];
      const out = ProductRecommendationService.recommend(products, {
        userId: "u1",
        garments: [],
        limitCount: 4,
      });
      expect(out.recommendations).toHaveLength(0);
    });

    it("returns empty when no products", () => {
      const out = ProductRecommendationService.recommend([], {
        userId: "u1",
        garments: GARMENTS,
        limitCount: 4,
      });
      expect(out.recommendations).toHaveLength(0);
    });

    it("returns recommendations with reason and score", () => {
      const products: ExternalProduct[] = [
        makeProduct({
          id: "shoes-1",
          name: "White Sneakers",
          category: "shoes",
          color: "white",
          productUrl: "https://x.com/s1",
        }),
      ];
      const out = ProductRecommendationService.recommend(products, {
        userId: "u1",
        garments: GARMENTS,
        limitCount: 4,
      });
      expect(out.recommendations.length).toBeGreaterThan(0);
      const rec = out.recommendations[0];
      expect(rec.product.id).toBe("shoes-1");
      expect(rec.reason).toBeTruthy();
      expect(rec.reason.length).toBeGreaterThan(0);
      expect(rec.score).toBeGreaterThanOrEqual(0);
      expect(rec.matchedGarmentIds).toBeDefined();
      expect(rec.sourceContext).toBeDefined();
    });

    it("prefers wardrobe gap (missing category)", () => {
      const products: ExternalProduct[] = [
        makeProduct({
          id: "acc-1",
          name: "Belt",
          category: "accessory",
          productUrl: "https://x.com/a1",
        }),
      ];
      const out = ProductRecommendationService.recommend(products, {
        userId: "u1",
        garments: GARMENTS,
        limitCount: 4,
      });
      expect(out.recommendations.length).toBeGreaterThan(0);
      expect(out.recommendations[0].product.category).toBe("accessory");
      expect(out.recommendations[0].reason).toBeTruthy();
    });

    it("respects limitCount", () => {
      const products: ExternalProduct[] = [
        makeProduct({
          id: "1",
          name: "A",
          category: "shoes",
          productUrl: "https://x.com/1",
        }),
        makeProduct({
          id: "2",
          name: "B",
          category: "accessory",
          productUrl: "https://x.com/2",
        }),
        makeProduct({
          id: "3",
          name: "C",
          category: "outerwear",
          productUrl: "https://x.com/3",
        }),
        makeProduct({
          id: "4",
          name: "D",
          category: "top",
          productUrl: "https://x.com/4",
        }),
        makeProduct({
          id: "5",
          name: "E",
          category: "bottom",
          productUrl: "https://x.com/5",
        }),
      ];
      const out = ProductRecommendationService.recommend(products, {
        userId: "u1",
        garments: GARMENTS,
        limitCount: 2,
      });
      expect(out.recommendations.length).toBeLessThanOrEqual(2);
    });

    it("justification is short and factual", () => {
      const products: ExternalProduct[] = [
        makeProduct({
          id: "j1",
          name: "Neutral Jacket",
          category: "outerwear",
          color: "beige",
          productUrl: "https://x.com/j1",
        }),
      ];
      const out = ProductRecommendationService.recommend(products, {
        userId: "u1",
        garments: GARMENTS,
        limitCount: 4,
      });
      if (out.recommendations.length > 0) {
        const reason = out.recommendations[0].reason;
        expect(reason.length).toBeLessThan(200);
        expect(reason).not.toMatch(/undefined|null/);
      }
    });
  });
});
