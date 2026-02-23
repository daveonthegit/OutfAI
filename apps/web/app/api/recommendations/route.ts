import { OutfitRecommendationService } from "@/../../server/services/outfitRecommendationService";
import { Garment, RecommendationInput } from "@/../../shared/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      mood,
      weather,
      temperature,
      occasion,
      limitCount = 5,
      garments = [],
    } = body;

    // Ensure garments have Date objects for createdAt
    const processedGarments: Garment[] = garments.map((g: any) => ({
      ...g,
      createdAt:
        g.createdAt instanceof Date ? g.createdAt : new Date(g.createdAt),
    }));

    const recommendationInput: RecommendationInput = {
      userId,
      mood,
      weather,
      temperature,
      occasion,
      limitCount,
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
