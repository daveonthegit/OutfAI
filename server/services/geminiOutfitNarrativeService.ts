import type {
  Garment,
  RecommendationInput,
  RecommendationOutput,
} from "../../shared/types";

export type OutfitNarrativePiece = {
  id: string;
  name: string;
  category: string;
  color: string;
  style: string[];
  material: string;
};

export type OutfitNarrativeContext = {
  mood?: string | null;
  weather?: string | null;
  temperature?: number | null;
  occasion?: string | null;
};

export type OutfitNarrativeRequestOutfit = {
  outfitId: string;
  currentExplanation: string;
  score?: number;
  pieces: OutfitNarrativePiece[];
};

export type OutfitNarrativeRequest = {
  context: OutfitNarrativeContext;
  outfits: OutfitNarrativeRequestOutfit[];
};

export type OutfitNarrativeResult = {
  overallExplanation?: string;
  outfitNarratives: Array<{ outfitId: string; explanation: string }>;
};

type GeminiNarrativeResponse = {
  overallExplanation?: string;
  outfitNarratives?: Array<{ outfitId: string; explanation: string }>;
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

  /**
   * Lightweight primitive: accepts a payload of outfits + context and returns
   * Gemini-rewritten explanations. Returns null when disabled or on any failure.
   */
  static async enhance(
    payload: OutfitNarrativeRequest
  ): Promise<OutfitNarrativeResult | null> {
    if (!this.isEnabled() || payload.outfits.length === 0) {
      return null;
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

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

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        console.warn(
          `[gemini-narrative] http ${response.status}: ${errBody.slice(0, 300)}`
        );
        return null;
      }
      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          finishReason?: string;
        }>;
        promptFeedback?: { blockReason?: string };
      };

      if (data.promptFeedback?.blockReason) {
        console.warn(
          `[gemini-narrative] blocked: ${data.promptFeedback.blockReason}`
        );
        return null;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.warn(
          `[gemini-narrative] empty text. finishReason=${data.candidates?.[0]?.finishReason ?? "?"}`
        );
        return null;
      }

      const stripped = text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      let parsed: GeminiNarrativeResponse;
      try {
        parsed = JSON.parse(stripped) as GeminiNarrativeResponse;
      } catch (parseErr) {
        console.warn(
          `[gemini-narrative] JSON parse failed: ${parseErr instanceof Error ? parseErr.message : "?"}; raw=${stripped.slice(0, 200)}`
        );
        return null;
      }

      const cleaned = (parsed.outfitNarratives ?? [])
        .filter((n) => n?.outfitId && n?.explanation)
        .map((n) => ({
          outfitId: n.outfitId,
          explanation: n.explanation.trim(),
        }));

      console.log(
        `[gemini-narrative] parsed ${cleaned.length}/${payload.outfits.length} narrative(s); overall=${parsed.overallExplanation ? "yes" : "no"}`
      );

      return {
        overallExplanation: parsed.overallExplanation?.trim(),
        outfitNarratives: cleaned,
      };
    } catch (err) {
      console.warn(
        `[gemini-narrative] unexpected error: ${err instanceof Error ? err.message : String(err)}`
      );
      return null;
    }
  }

  /**
   * Convenience wrapper for callers that already have a full RecommendationOutput
   * and the wardrobe Garment[] in scope. Falls back to the original result on any failure.
   */
  static async enhanceNarratives(
    garments: Garment[],
    input: RecommendationInput,
    result: RecommendationOutput
  ): Promise<RecommendationOutput> {
    const garmentById = new Map(garments.map((g) => [g.id, g]));

    const payload: OutfitNarrativeRequest = {
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

    const enhanced = await this.enhance(payload);
    if (!enhanced) return result;

    const narratives = new Map(
      enhanced.outfitNarratives.map((n) => [n.outfitId, n.explanation])
    );

    const outfits = result.outfits.map((o) => {
      const rewritten = narratives.get(o.id);
      return rewritten ? { ...o, explanation: rewritten } : o;
    });

    return {
      ...result,
      explanation: enhanced.overallExplanation || result.explanation,
      outfits,
    };
  }
}
