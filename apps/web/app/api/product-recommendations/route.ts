import { ProductRecommendationService } from "@/../../server/services/productRecommendationService";
import type {
  Garment,
  ExternalProduct,
  ProductRecommendationInput,
  Mood,
  WeatherCondition,
} from "@/../../shared/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/product-recommendations
 *
 * Wardrobe-first external product suggestions.
 * Call after outfit results; requires garments. Products are passed in the body
 * (client fetches from Convex externalProducts.list).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      garments = [],
      products = [],
      outfitGarmentIds,
      mood,
      weather,
      temperature,
      occasion,
      limitCount = 4,
    } = body;

    if (!userId || !Array.isArray(garments) || garments.length === 0) {
      return NextResponse.json(
        { error: "userId and garments are required" },
        { status: 400 }
      );
    }

    const processedGarments: Garment[] = garments.map(
      (g: Record<string, unknown>) => ({
        ...g,
        id: String(g.id),
        userId: String(g.userId),
        name: String(g.name ?? ""),
        category: String(g.category ?? "top") as Garment["category"],
        primaryColor: String(g.primaryColor ?? ""),
        tags: Array.isArray(g.tags) ? g.tags.map(String) : [],
        createdAt:
          g.createdAt instanceof Date
            ? g.createdAt
            : new Date(String(g.createdAt ?? Date.now())),
      })
    );

    const externalProducts: ExternalProduct[] = products
      .filter(
        (p: Record<string, unknown>) => p && typeof p.productUrl === "string"
      )
      .map((p: Record<string, unknown>) => ({
        id: String(p.id ?? p._id),
        source: String(p.source ?? "unknown"),
        sourceProductId: String(p.sourceProductId ?? p.id ?? p._id),
        name: String(p.name ?? "Unknown"),
        brand: p.brand != null ? String(p.brand) : undefined,
        category: String(p.category ?? "top"),
        subcategory: p.subcategory != null ? String(p.subcategory) : undefined,
        color: p.color != null ? String(p.color) : undefined,
        styleTags: Array.isArray(p.styleTags)
          ? p.styleTags.map(String)
          : undefined,
        occasionTags: Array.isArray(p.occasionTags)
          ? p.occasionTags.map(String)
          : undefined,
        price: typeof p.price === "number" ? p.price : undefined,
        currency: p.currency != null ? String(p.currency) : undefined,
        imageUrl: p.imageUrl != null ? String(p.imageUrl) : undefined,
        productUrl: String(p.productUrl),
        affiliateUrl:
          p.affiliateUrl != null ? String(p.affiliateUrl) : undefined,
        availability:
          p.availability != null ? String(p.availability) : undefined,
        createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
        updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
      }));

    const input: ProductRecommendationInput = {
      userId: String(userId),
      garments: processedGarments,
      outfitGarmentIds: Array.isArray(outfitGarmentIds)
        ? outfitGarmentIds.map(String)
        : undefined,
      mood: mood != null ? (String(mood) as Mood) : undefined,
      weather:
        weather != null ? (String(weather) as WeatherCondition) : undefined,
      temperature: typeof temperature === "number" ? temperature : undefined,
      occasion: occasion != null ? String(occasion) : undefined,
      limitCount: typeof limitCount === "number" ? Math.min(limitCount, 8) : 4,
    };

    const result = ProductRecommendationService.recommend(
      externalProducts,
      input
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Product recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get product recommendations" },
      { status: 500 }
    );
  }
}
