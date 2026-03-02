import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { analyzeGarmentImage } from "./garmentImageAnalysisService";

vi.mock("@google-cloud/vision", () => ({
  ImageAnnotatorClient: vi.fn().mockImplementation(() => ({
    batchAnnotateImages: vi.fn(),
  })),
}));

describe("garmentImageAnalysisService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws on empty or invalid image data", async () => {
    await expect(analyzeGarmentImage("")).rejects.toThrow("Invalid image data");
    await expect(analyzeGarmentImage("   ")).rejects.toThrow(
      "Invalid image data"
    );
    await expect(analyzeGarmentImage("data:image/png;base64,")).rejects.toThrow(
      "Invalid image data"
    );
  });

  it("returns analysis from Vision API labels and dominant color", async () => {
    const { ImageAnnotatorClient } = await import("@google-cloud/vision");
    const mockBatch = vi.fn().mockResolvedValue([
      {
        responses: [
          {
            labelAnnotations: [
              { description: "Shirt", score: 0.95 },
              { description: "Clothing", score: 0.9 },
              { description: "Blue", score: 0.85 },
              { description: "Casual wear", score: 0.8 },
            ],
            imagePropertiesAnnotation: {
              dominantColors: {
                colors: [
                  {
                    color: { red: 0.12, green: 0.45, blue: 0.9 },
                    pixelFraction: 0.4,
                  },
                ],
              },
            },
          },
        ],
      },
    ]);
    (ImageAnnotatorClient as unknown as Mock).mockImplementation(() => ({
      batchAnnotateImages: mockBatch,
    }));

    const result = await analyzeGarmentImage(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    );

    expect(mockBatch).toHaveBeenCalledWith({
      requests: [
        {
          image: { content: expect.any(String) },
          features: [
            { type: "LABEL_DETECTION", maxResults: 20 },
            { type: "IMAGE_PROPERTIES" },
          ],
        },
      ],
    });
    expect(result.category).toBe("top");
    expect(result.color).toBeDefined();
    expect([
      "Black",
      "White",
      "Grey",
      "Navy",
      "Brown",
      "Cream",
      "Indigo",
      "Olive",
      "Red",
      "Blue",
      "Green",
      "Beige",
      "Pink",
      "Yellow",
    ]).toContain(result.color);
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.style).toBeDefined();
    expect(result.occasion).toBeDefined();
    expect(result.fit).toBe("relaxed");
    expect(result.versatility).toBe("medium");
    expect(result.vibrancy).toBe("balanced");
  });

  it("handles Vision API error response", async () => {
    const { ImageAnnotatorClient } = await import("@google-cloud/vision");
    (ImageAnnotatorClient as unknown as Mock).mockImplementation(() => ({
      batchAnnotateImages: vi.fn().mockResolvedValue([
        {
          responses: [
            { error: { code: 16, message: "Image could not be processed" } },
          ],
        },
      ]),
    }));

    await expect(analyzeGarmentImage("dGVzdA==")).rejects.toThrow(
      "Image could not be processed"
    );
  });

  it("handles permission denied (code 7)", async () => {
    const { ImageAnnotatorClient } = await import("@google-cloud/vision");
    (ImageAnnotatorClient as unknown as Mock).mockImplementation(() => ({
      batchAnnotateImages: vi.fn().mockResolvedValue([
        {
          responses: [{ error: { code: 7, message: "Permission denied" } }],
        },
      ]),
    }));

    await expect(analyzeGarmentImage("dGVzdA==")).rejects.toThrow(
      /GOOGLE_APPLICATION_CREDENTIALS/
    );
  });
});
