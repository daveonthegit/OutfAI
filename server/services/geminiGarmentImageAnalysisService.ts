import type { GarmentImageAnalysis } from "./garmentImageAnalysisService";

type GeminiGarmentImageResponse = Partial<GarmentImageAnalysis>;

const VALID_CATEGORIES = new Set<GarmentImageAnalysis["category"]>([
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
]);
const VALID_VERSATILITY = new Set<GarmentImageAnalysis["versatility"]>([
  "high",
  "medium",
  "low",
]);
const VALID_VIBRANCY = new Set<GarmentImageAnalysis["vibrancy"]>([
  "muted",
  "balanced",
  "vibrant",
]);

function normalizeArray(input: unknown, fallback: string[]): string[] {
  if (!Array.isArray(input)) return fallback;
  const cleaned = input
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, 8);
  return cleaned.length > 0 ? cleaned : fallback;
}

function cleanBase64(imageBase64: string): string {
  return imageBase64.startsWith("data:")
    ? (imageBase64.split(",")[1] ?? "")
    : imageBase64;
}

export class GeminiGarmentImageAnalysisService {
  static isEnabled(): boolean {
    return (
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_IMAGE_TAGGING_ENABLED === "true"
    );
  }

  static async analyze(imageBase64: string): Promise<GarmentImageAnalysis> {
    const raw = cleanBase64(imageBase64).trim();
    if (!raw) throw new Error("Invalid image data");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is required");

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const prompt = [
      "Analyze this clothing image and return strict JSON only.",
      "Schema:",
      '{ "category": "top|bottom|shoes|outerwear|accessory", "color": "string", "tags": ["string"], "style": ["string"], "fit": "string", "occasion": ["string"], "versatility": "high|medium|low", "vibrancy": "muted|balanced|vibrant", "nameSuggestion": "string" }',
      "Do not include markdown fences.",
      "Focus on the main garment in the image.",
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: raw,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini image analysis request failed");
    }

    const body = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned empty analysis");

    const parsed = JSON.parse(text) as GeminiGarmentImageResponse;

    const category = VALID_CATEGORIES.has(
      parsed.category as GarmentImageAnalysis["category"]
    )
      ? (parsed.category as GarmentImageAnalysis["category"])
      : "top";
    const color = String(parsed.color ?? "Black").trim() || "Black";
    const tags = normalizeArray(parsed.tags, ["casual"]);
    const style = normalizeArray(parsed.style, ["casual"]);
    const fit = String(parsed.fit ?? "relaxed").trim() || "relaxed";
    const occasion = normalizeArray(parsed.occasion, ["casual"]);
    const versatility = VALID_VERSATILITY.has(
      parsed.versatility as GarmentImageAnalysis["versatility"]
    )
      ? (parsed.versatility as GarmentImageAnalysis["versatility"])
      : "medium";
    const vibrancy = VALID_VIBRANCY.has(
      parsed.vibrancy as GarmentImageAnalysis["vibrancy"]
    )
      ? (parsed.vibrancy as GarmentImageAnalysis["vibrancy"])
      : "balanced";
    const nameSuggestion = parsed.nameSuggestion
      ? String(parsed.nameSuggestion).trim()
      : undefined;

    return {
      category,
      color,
      tags,
      style,
      fit,
      occasion,
      versatility,
      vibrancy,
      nameSuggestion,
    };
  }
}
