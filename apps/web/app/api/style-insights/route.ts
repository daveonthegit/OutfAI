import { StyleInsightsService } from "@/../../server/services/styleInsightsService";
import type { Garment, Mood, Season } from "@/../../shared/types";
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

/**
 * POST /api/style-insights
 *
 * Returns wardrobe gaps, complete-the-look tips, and style/occasion pairing advice.
 */
export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const key = rateLimitKey(request, "style-insights");
  if (!checkRateLimit(key, RATE_MAX, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const tooLarge = rejectIfBodyTooLarge(request, MAX_BODY_BYTES);
  if (tooLarge) return tooLarge;

  try {
    const body = await request.json();
    const {
      garments = [],
      outfitGarmentIds,
      mood,
      occasion,
      temperature,
    } = body;

    if (!Array.isArray(garments) || garments.length === 0) {
      return NextResponse.json(
        { error: "garments array is required and must not be empty" },
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

    const result = StyleInsightsService.getInsights({
      garments: processedGarments,
      outfitGarmentIds: Array.isArray(outfitGarmentIds)
        ? outfitGarmentIds.map(String)
        : undefined,
      mood: mood != null ? (mood as Mood) : undefined,
      occasion: occasion != null ? String(occasion) : undefined,
      temperature: typeof temperature === "number" ? temperature : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Style insights error:", error);
    return NextResponse.json(
      { error: "Failed to get style insights" },
      { status: 500 }
    );
  }
}
