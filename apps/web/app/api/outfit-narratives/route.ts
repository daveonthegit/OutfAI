import { GeminiOutfitNarrativeService } from "@/../../server/services/geminiOutfitNarrativeService";
import type {
  Garment,
  Mood,
  Outfit,
  RecommendationInput,
  RecommendationOutput,
  WeatherCondition,
} from "@/../../shared/types";
import {
  rejectIfBodyTooLarge,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { loadGarmentsForAuthenticatedUser } from "@/lib/load-user-garments";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 256 * 1024;

type RequestOutfit = {
  outfitId: string;
  garmentIds: string[];
  currentExplanation: string;
  score: number;
};

type RequestBody = {
  context?: {
    mood?: Mood | null;
    weather?: WeatherCondition | null;
    temperature?: number | null;
    occasion?: string | null;
  };
  outfits?: RequestOutfit[];
};

/**
 * POST /api/outfit-narratives
 *
 * Rewrites outfit explanation copy via Gemini. When the feature flag is off,
 * returns `{ enhanced: false }` so the client keeps the deterministic text.
 */
export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;
  const user = userOr401;

  const rateLimited = await enforceRateLimit(request, "outfit-narratives");
  if (rateLimited) return rateLimited;

  const tooLarge = rejectIfBodyTooLarge(request, MAX_BODY_BYTES);
  if (tooLarge) return tooLarge;

  const enabled = GeminiOutfitNarrativeService.isEnabled();
  console.log(
    `[outfit-narratives] isEnabled=${enabled} hasKey=${Boolean(process.env.GEMINI_API_KEY)} narrativeFlag=${process.env.GEMINI_NARRATIVE_ENABLED ?? "<unset>"}`
  );
  if (!enabled) {
    return NextResponse.json({ enhanced: false });
  }

  try {
    const body = (await request.json()) as RequestBody;
    const reqOutfits = Array.isArray(body.outfits) ? body.outfits : [];
    if (reqOutfits.length === 0) {
      return NextResponse.json({ enhanced: false });
    }

    const uniqueGarmentIds = Array.from(
      new Set(
        reqOutfits.flatMap((o) =>
          Array.isArray(o.garmentIds) ? o.garmentIds.map(String) : []
        )
      )
    );

    if (uniqueGarmentIds.length === 0) {
      return NextResponse.json({ enhanced: false });
    }

    const loaded = await loadGarmentsForAuthenticatedUser(uniqueGarmentIds);
    if (!loaded.ok) return loaded.response;

    const garments: Garment[] = loaded.garments;

    const input: RecommendationInput = {
      userId: user._id,
      mood: body.context?.mood ?? undefined,
      weather: body.context?.weather ?? undefined,
      temperature: body.context?.temperature ?? undefined,
      occasion: body.context?.occasion ?? undefined,
    };

    const outfits: Outfit[] = reqOutfits.map((o) => ({
      id: String(o.outfitId),
      userId: user._id,
      garmentIds: Array.isArray(o.garmentIds) ? o.garmentIds.map(String) : [],
      explanation: String(o.currentExplanation ?? ""),
      score: typeof o.score === "number" ? o.score : 0,
      contextMood: input.mood,
      contextWeather: input.weather,
      createdAt: new Date(),
    }));

    const original: RecommendationOutput = {
      outfits,
      explanation: outfits[0]?.explanation ?? "",
      totalGenerated: outfits.length,
    };

    const enhanced = await GeminiOutfitNarrativeService.enhanceNarratives(
      garments,
      input,
      original
    );

    const outfitNarratives = enhanced.outfits
      .map((o, i) => {
        const before = original.outfits[i]?.explanation ?? "";
        const after = o.explanation ?? "";
        return after && after !== before
          ? { outfitId: o.id, explanation: after }
          : null;
      })
      .filter(
        (n): n is { outfitId: string; explanation: string } => n !== null
      );

    const overallChanged =
      enhanced.explanation && enhanced.explanation !== original.explanation;

    if (outfitNarratives.length === 0 && !overallChanged) {
      return NextResponse.json({ enhanced: false });
    }

    console.log(
      `[outfit-narratives] gemini rewrote ${outfitNarratives.length}/${outfits.length} outfit(s)`
    );

    return NextResponse.json({
      enhanced: true,
      overallExplanation: overallChanged ? enhanced.explanation : undefined,
      outfitNarratives,
    });
  } catch (error) {
    console.error("Outfit narratives error:", error);
    return NextResponse.json({ enhanced: false }, { status: 200 });
  }
}
