import { OutfitRecommendationService } from "@/../../server/services/outfitRecommendationService";
import { GeminiOutfitGenerationService } from "@/../../server/services/geminiOutfitGenerationService";
import type {
  RecommendationInput,
  UserStylePreferences,
} from "@/../../shared/types";
import {
  rejectIfBodyTooLarge,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { loadGarmentsForAuthenticatedUser } from "@/lib/load-user-garments";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 512 * 1024;

export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const rateLimited = await enforceRateLimit(request, "recommendations");
  if (rateLimited) return rateLimited;

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
      preferences,
      recentGarmentIds,
      garmentIds,
    } = body as {
      mood?: RecommendationInput["mood"];
      weather?: RecommendationInput["weather"];
      temperature?: number;
      occasion?: string;
      limitCount?: number;
      preferences?: UserStylePreferences;
      recentGarmentIds?: string[];
      garmentIds?: string[];
    };

    if (garmentIds != null && !Array.isArray(garmentIds)) {
      return NextResponse.json(
        { error: "garmentIds must be an array when provided" },
        { status: 400 }
      );
    }

    const ids =
      Array.isArray(garmentIds) && garmentIds.length > 0
        ? garmentIds.map(String)
        : undefined;

    const loaded = await loadGarmentsForAuthenticatedUser(ids);
    if (!loaded.ok) return loaded.response;

    const processedGarments = loaded.garments;
    if (processedGarments.length === 0) {
      return NextResponse.json(
        { error: "Add garments to your closet first" },
        { status: 400 }
      );
    }

    const recommendationInput: RecommendationInput = {
      userId: userOr401._id,
      mood,
      weather,
      temperature,
      occasion,
      limitCount,
      preferences,
      recentGarmentIds: Array.isArray(recentGarmentIds)
        ? recentGarmentIds.map(String)
        : undefined,
    };

    const aiGenerated = await GeminiOutfitGenerationService.generateGeminiFirst(
      processedGarments,
      recommendationInput
    );

    if (aiGenerated) {
      return NextResponse.json(aiGenerated);
    }

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
