import type {
  Garment,
  RecommendationInput,
  RecommendationOutput,
} from "../../shared/types";

type OutfitNarrative = {
  outfitId: string;
  explanation: string;
};

type GeminiNarrativeResponse = {
  overallExplanation?: string;
  outfitNarratives?: OutfitNarrative[];
};

/**
 * Optional AI enhancer for recommendation copy.
 * Keeps outfit selection/scoring deterministic and only rewrites text.
 */
export class GeminiOutfitNarrativeService {
  static isEnabled(): boolean {
    return (
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_NARRATIVE_ENABLED === "true"
    );
  }

  static async enhanceNarratives(
    garments: Garment[],
    input: RecommendationInput,
    result: RecommendationOutput
  ): Promise<RecommendationOutput> {
    if (!this.isEnabled() || result.outfits.length === 0) {
      return result;
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return result;

    const garmentById = new Map(garments.map((g) => [g.id, g]));

    const payload = {
      context: {
        mood: input.mood ?? null,
        weather: input.weather ?? null,
        temperature: input.temperature ?? null,
        occasion: input.occasion ?? null,
      },
      outfits: result.outfits.map((o) => ({
        outfitId: o.id,
        score: o.score,
        currentExplanation: o.explanation,
        pieces: o.garmentIds.map((id) => {
          const g = garmentById.get(id);
          return {
            id,
            name: g?.name ?? "Unknown item",
            category: g?.category ?? "unknown",
            color: g?.primaryColor ?? "",
            style: g?.style ?? [],
            material: g?.material ?? "",
          };
        }),
      })),
    };

    const prompt = [
      "You are a fashion assistant for a wardrobe app.",
      "Rewrite outfit explanations with concise, practical, and encouraging language.",
      "Keep each outfit explanation under 140 characters.",
      "Return strict JSON only with keys:",
      '{ "overallExplanation": string, "outfitNarratives": [{ "outfitId": string, "explanation": string }] }',
      "Do not invent garments. Use provided context and pieces only.",
      "Input JSON:",
      JSON.stringify(payload),
    ].join("\n");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) return result;
      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return result;

      const parsed = JSON.parse(text) as GeminiNarrativeResponse;
      const narratives = new Map(
        (parsed.outfitNarratives ?? [])
          .filter((n) => n?.outfitId && n?.explanation)
          .map((n) => [n.outfitId, n.explanation.trim()])
      );

      const outfits = result.outfits.map((o) => {
        const rewritten = narratives.get(o.id);
        return rewritten ? { ...o, explanation: rewritten } : o;
      });

      return {
        ...result,
        explanation: parsed.overallExplanation?.trim() || result.explanation,
        outfits,
      };
    } catch {
      // Best-effort enhancer: never fail recommendation delivery.
      return result;
    }
  }
}
