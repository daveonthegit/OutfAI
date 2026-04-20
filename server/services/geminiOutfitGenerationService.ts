import type {
  Garment,
  RecommendationInput,
  RecommendationOutput,
} from "../../shared/types";

type GeminiOutfitResponse = {
  overallExplanation?: string;
  outfits?: Array<{
    garmentIds?: string[];
    explanation?: string;
    score?: number;
  }>;
};

export class GeminiOutfitGenerationService {
  static isEnabled(): boolean {
    return (
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_OUTFIT_GENERATION_ENABLED === "true"
    );
  }

  static async generateGeminiFirst(
    garments: Garment[],
    input: RecommendationInput
  ): Promise<RecommendationOutput | null> {
    if (!this.isEnabled()) return null;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const prompt = [
      "You are an outfit recommendation engine.",
      "Generate full recommendations from this closet using mood/weather/temperature/occasion context.",
      "Return strict JSON only with keys:",
      '{ "overallExplanation": string, "outfits": [{ "garmentIds": string[], "explanation": string, "score": number }] }',
      "Rules:",
      "- Use only garment IDs from input.",
      "- Each outfit must include at least one top and one bottom.",
      "- Keep explanations concise and practical.",
      "- score must be 0-100.",
      "Input:",
      JSON.stringify({
        mood: input.mood ?? null,
        weather: input.weather ?? null,
        temperature: input.temperature ?? null,
        occasion: input.occasion ?? null,
        limitCount: input.limitCount ?? 5,
        garments: garments.map((g) => ({
          id: g.id,
          name: g.name,
          category: g.category,
          color: g.primaryColor,
          style: g.style ?? [],
          material: g.material ?? "",
          occasion: g.occasion ?? [],
          tags: g.tags,
        })),
      }),
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
              temperature: 0.35,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) return null;
      const body = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      const parsed = JSON.parse(text) as GeminiOutfitResponse;
      const garmentById = new Map(garments.map((g) => [g.id, g]));
      const maxCount = Math.max(1, input.limitCount ?? 5);

      const sanitizedOutfits = (parsed.outfits ?? [])
        .map((o, index) => {
          const ids = [...new Set((o.garmentIds ?? []).map(String))].filter(
            (id) => garmentById.has(id)
          );
          if (ids.length < 2) return null;

          const pieces = ids
            .map((id) => garmentById.get(id))
            .filter(Boolean) as Garment[];
          const hasTop = pieces.some((g) => g.category === "top");
          const hasBottom = pieces.some((g) => g.category === "bottom");
          if (!hasTop || !hasBottom) return null;

          const safeScore = Number(o.score);
          const score = Number.isFinite(safeScore)
            ? Math.max(0, Math.min(100, Math.round(safeScore)))
            : 70;

          const explanation =
            String(o.explanation ?? "").trim() || "AI-generated outfit.";

          return {
            id: `outfit-gemini-${Date.now()}-${index}`,
            userId: input.userId,
            garmentIds: ids,
            contextWeather: input.weather,
            contextMood: input.mood,
            explanation,
            score,
            createdAt: new Date(),
          };
        })
        .filter(Boolean)
        .slice(0, maxCount) as RecommendationOutput["outfits"];

      if (sanitizedOutfits.length === 0) return null;

      return {
        outfits: sanitizedOutfits,
        explanation:
          String(parsed.overallExplanation ?? "").trim() ||
          "Gemini-generated outfit recommendations.",
        totalGenerated: sanitizedOutfits.length,
      };
    } catch {
      return null;
    }
  }
}
