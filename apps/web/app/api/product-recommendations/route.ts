import { ProductRecommendationService } from "@/../../server/services/productRecommendationService";
import type {
  Mood,
  ProductRecommendationInput,
  WeatherCondition,
} from "@/../../shared/types";
import {
  rejectIfBodyTooLarge,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { loadExternalProductsForAuthenticatedUser } from "@/lib/load-external-products";
import { loadGarmentsForAuthenticatedUser } from "@/lib/load-user-garments";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 512 * 1024;

/**
 * POST /api/product-recommendations
 *
 * Wardrobe-first external product suggestions. Garments and products are loaded server-side;
 * optional id lists filter the closet/catalog subset.
 */
export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const rateLimited = await enforceRateLimit(
    request,
    "product-recommendations"
  );
  if (rateLimited) return rateLimited;

  const tooLarge = rejectIfBodyTooLarge(request, MAX_BODY_BYTES);
  if (tooLarge) return tooLarge;

  try {
    const body = await request.json();
    const {
      garmentIds,
      productIds,
      outfitGarmentIds,
      mood,
      weather,
      temperature,
      occasion,
      limitCount = 4,
    } = body as {
      garmentIds?: string[];
      productIds?: string[];
      outfitGarmentIds?: string[];
      mood?: Mood;
      weather?: WeatherCondition;
      temperature?: number;
      occasion?: string;
      limitCount?: number;
    };

    const gIds =
      Array.isArray(garmentIds) && garmentIds.length > 0
        ? garmentIds.map(String)
        : undefined;

    const garmentsLoaded = await loadGarmentsForAuthenticatedUser(gIds);
    if (!garmentsLoaded.ok) return garmentsLoaded.response;

    if (garmentsLoaded.garments.length === 0) {
      return NextResponse.json(
        { error: "garments are required — add items to your closet first" },
        { status: 400 }
      );
    }

    const pIds =
      Array.isArray(productIds) && productIds.length > 0
        ? productIds.map(String)
        : undefined;

    const productsLoaded = await loadExternalProductsForAuthenticatedUser({
      limit: 80,
      productIds: pIds,
    });
    if (!productsLoaded.ok) return productsLoaded.response;

    const input: ProductRecommendationInput = {
      userId: userOr401._id,
      garments: garmentsLoaded.garments,
      outfitGarmentIds: Array.isArray(outfitGarmentIds)
        ? outfitGarmentIds.map(String)
        : undefined,
      mood,
      weather,
      temperature: typeof temperature === "number" ? temperature : undefined,
      occasion: occasion != null ? String(occasion) : undefined,
      limitCount: typeof limitCount === "number" ? Math.min(limitCount, 8) : 4,
    };

    const result = ProductRecommendationService.recommend(
      productsLoaded.products,
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
