import { OutfitRecommendationService } from "@/../../server/services/outfitRecommendationService";
import type {
  Garment,
  RecommendationInput,
  Season,
  UserStylePreferences,
} from "@/../../shared/types";
import {
  assertGarmentsBelongToUser,
  checkRateLimit,
  rateLimitKey,
  rejectIfBodyTooLarge,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 512 * 1024;
const RATE_MAX = 40;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const key = rateLimitKey(request, "recommendations");
  if (!checkRateLimit(key, RATE_MAX, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const tooLarge = rejectIfBodyTooLarge(request, MAX_BODY_BYTES);
  if (tooLarge) return tooLarge;

  try {
    const body = await request.json();
    const {
      mood,
      weather,
      temperature,
      occasion,
      limitCount = 5,
      garments = [],
      preferences,
      recentGarmentIds,
    } = body;

    if (!Array.isArray(garments)) {
      return NextResponse.json(
        { error: "garments must be an array" },
        { status: 400 }
      );
    }

    const processedGarments: Garment[] = garments.map(
      (g: Record<string, unknown>) => ({
        id: String(g.id),
        userId: String(g.userId ?? ""),
        name: String(g.name ?? ""),
        category: String(g.category ?? "top") as Garment["category"],
        primaryColor: String(g.primaryColor ?? ""),
        tags: Array.isArray(g.tags) ? g.tags.map(String) : [],
        style: Array.isArray(g.style) ? g.style.map(String) : undefined,
        fit: g.fit != null ? String(g.fit) : undefined,
        occasion: Array.isArray(g.occasion)
          ? g.occasion.map(String)
          : undefined,
        versatility:
          g.versatility != null
            ? (String(g.versatility) as Garment["versatility"])
            : undefined,
        vibrancy:
          g.vibrancy != null
            ? (String(g.vibrancy) as Garment["vibrancy"])
            : undefined,
        material: g.material != null ? String(g.material) : undefined,
        season: g.season != null ? (String(g.season) as Season) : undefined,
        imageUrl: g.imageUrl != null ? String(g.imageUrl) : undefined,
        createdAt:
          g.createdAt instanceof Date
            ? g.createdAt
            : new Date(String(g.createdAt ?? Date.now())),
      })
    );

    if (!assertGarmentsBelongToUser(processedGarments, userOr401._id)) {
      return NextResponse.json(
        { error: "Invalid wardrobe payload" },
        { status: 403 }
      );
    }

    const recommendationInput: RecommendationInput = {
      userId: userOr401._id,
      mood,
      weather,
      temperature,
      occasion,
      limitCount,
      preferences: preferences as UserStylePreferences | undefined,
      recentGarmentIds: Array.isArray(recentGarmentIds)
        ? (recentGarmentIds as string[])
        : undefined,
    };

    const result = await OutfitRecommendationService.generateOutfits(
      processedGarments,
      recommendationInput
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
