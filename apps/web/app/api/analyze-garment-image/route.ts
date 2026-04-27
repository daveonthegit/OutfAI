import { analyzeGarmentImage } from "@/../../server/services/garmentImageAnalysisService";
import { GeminiGarmentImageAnalysisService } from "@/../../server/services/geminiGarmentImageAnalysisService";
import {
  rejectIfBodyTooLarge,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 6 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const rateLimited = await enforceRateLimit(request, "analyze-garment-image");
  if (rateLimited) return rateLimited;

  const tooLarge = rejectIfBodyTooLarge(request, MAX_BODY_BYTES);
  if (tooLarge) return tooLarge;

  try {
    const body = await request.json();
    const { imageBase64 } = body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "imageBase64 is required" },
        { status: 400 }
      );
    }
    if (GeminiGarmentImageAnalysisService.isEnabled()) {
      try {
        const geminiResult =
          await GeminiGarmentImageAnalysisService.analyze(imageBase64);
        console.log("[analyze-garment-image] served by gemini");
        return NextResponse.json(geminiResult);
      } catch (geminiError) {
        console.warn(
          "[analyze-garment-image] gemini failed, falling back to vision:",
          geminiError instanceof Error ? geminiError.message : geminiError
        );
      }
    }

    const result = await analyzeGarmentImage(imageBase64);
    console.log("[analyze-garment-image] served by vision");
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image analysis failed";
    const status =
      message.includes("Invalid image") || message.includes("required")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
