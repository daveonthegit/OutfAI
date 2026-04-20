import { StyleInsightsService } from "@/../../server/services/styleInsightsService";
import type { Mood } from "@/../../shared/types";
import {
  rejectIfBodyTooLarge,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { loadGarmentsForAuthenticatedUser } from "@/lib/load-user-garments";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 512 * 1024;

/**
 * POST /api/style-insights
 *
 * Returns wardrobe gaps, complete-the-look tips, and style/occasion pairing advice.
 */
export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const rateLimited = await enforceRateLimit(request, "style-insights");
  if (rateLimited) return rateLimited;

  const tooLarge = rejectIfBodyTooLarge(request, MAX_BODY_BYTES);
  if (tooLarge) return tooLarge;

  try {
    const body = await request.json();
    const { garmentIds, outfitGarmentIds, mood, occasion, temperature } =
      body as {
        garmentIds?: string[];
        outfitGarmentIds?: string[];
        mood?: Mood;
        occasion?: string;
        temperature?: number;
      };

    const ids =
      Array.isArray(garmentIds) && garmentIds.length > 0
        ? garmentIds.map(String)
        : undefined;

    const loaded = await loadGarmentsForAuthenticatedUser(ids);
    if (!loaded.ok) return loaded.response;

    if (loaded.garments.length === 0) {
      return NextResponse.json(
        { error: "Add garments to your closet first" },
        { status: 400 }
      );
    }

    const result = StyleInsightsService.getInsights({
      garments: loaded.garments,
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
