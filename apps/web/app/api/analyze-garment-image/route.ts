import { analyzeGarmentImage } from "@/../../server/services/garmentImageAnalysisService";
import {
  checkRateLimit,
  rateLimitKey,
  rejectIfBodyTooLarge,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 6 * 1024 * 1024;
const RATE_MAX = 20;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const key = rateLimitKey(request, "analyze-garment-image");
  if (!checkRateLimit(key, RATE_MAX, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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
    const result = await analyzeGarmentImage(imageBase64);
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
