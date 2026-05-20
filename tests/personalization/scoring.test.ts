import { describe, expect, it } from "vitest";
import { scoreOutfitPersonalized } from "../../convex/personalization/scoring";
import type { Doc, Id } from "../../convex/_generated/dataModel";

function g(
  partial: Partial<Doc<"garments">> & Pick<Doc<"garments">, "_id" | "userId">
): Doc<"garments"> {
  return {
    _creationTime: 0,
    name: "x",
    category: "top",
    primaryColor: "black",
    tags: [],
    ...partial,
  } as Doc<"garments">;
}

describe("scoreOutfitPersonalized", () => {
  it("is deterministic for fixed inputs", () => {
    const garments = [
      g({
        _id: "a" as Id<"garments">,
        userId: "u",
        category: "top",
        primaryColor: "black",
        versatility: "high",
      }),
      g({
        _id: "b" as Id<"garments">,
        userId: "u",
        category: "bottom",
        primaryColor: "black",
        versatility: "high",
      }),
      g({
        _id: "c" as Id<"garments">,
        userId: "u",
        category: "shoes",
        primaryColor: "white",
        versatility: "medium",
      }),
    ];
    const a = scoreOutfitPersonalized(
      garments,
      { mood: "minimalist", weather: "cloudy", temperature: 18 },
      undefined,
      undefined,
      0
    );
    const b = scoreOutfitPersonalized(
      garments,
      { mood: "minimalist", weather: "cloudy", temperature: 18 },
      undefined,
      undefined,
      0
    );
    expect(a.finalScore).toBe(b.finalScore);
    expect(a.baseScore).toBe(b.baseScore);
  });

  it("ramps α with totalActions", () => {
    const garments = [
      g({
        _id: "a" as Id<"garments">,
        userId: "u",
        category: "top",
        primaryColor: "navy",
      }),
      g({
        _id: "b" as Id<"garments">,
        userId: "u",
        category: "bottom",
        primaryColor: "navy",
      }),
      g({
        _id: "c" as Id<"garments">,
        userId: "u",
        category: "shoes",
        primaryColor: "navy",
      }),
    ];
    const learned = {
      color: { navy: 0.8 },
    };
    const low = scoreOutfitPersonalized(garments, {}, learned, undefined, 0);
    const high = scoreOutfitPersonalized(garments, {}, learned, undefined, 100);
    expect(Math.abs(high.combinedPersonal)).toBeGreaterThan(
      Math.abs(low.combinedPersonal)
    );
  });

  it("clamps combined personal contribution", () => {
    const garments = [
      g({
        _id: "a" as Id<"garments">,
        userId: "u",
        category: "top",
        primaryColor: "x",
      }),
      g({
        _id: "b" as Id<"garments">,
        userId: "u",
        category: "bottom",
        primaryColor: "x",
      }),
      g({
        _id: "c" as Id<"garments">,
        userId: "u",
        category: "shoes",
        primaryColor: "x",
      }),
    ];
    const learned = {
      color: { x: 1, y: 1, z: 1 },
      style: { a: 1, b: 1 },
      tag: {},
      occasion: {},
      category: { top: 1, bottom: 1, shoes: 1 },
    };
    const r = scoreOutfitPersonalized(garments, {}, learned, undefined, 50);
    expect(r.combinedPersonal).toBeGreaterThanOrEqual(-0.5);
    expect(r.combinedPersonal).toBeLessThanOrEqual(0.5);
  });

  it("surfaces explicit preference contributors for cold-start explanations", () => {
    const garments = [
      g({
        _id: "a" as Id<"garments">,
        userId: "u",
        category: "top",
        primaryColor: "navy",
        style: ["minimalist"],
      }),
      g({
        _id: "b" as Id<"garments">,
        userId: "u",
        category: "bottom",
        primaryColor: "black",
        style: ["minimalist"],
      }),
      g({
        _id: "c" as Id<"garments">,
        userId: "u",
        category: "shoes",
        primaryColor: "white",
      }),
    ];

    const r = scoreOutfitPersonalized(
      garments,
      { mood: "minimalist", weather: "cloudy", temperature: 18 },
      undefined,
      {
        preferredStyles: ["minimalist"],
        preferredColors: ["navy"],
        avoidedColors: ["orange"],
      },
      0
    );

    expect(r.topContributors.length).toBeGreaterThan(0);
    expect(r.topContributors[0]?.contribution).toBeGreaterThan(0);
    expect(r.topContributors.map((c) => `${c.dim}:${c.value}`)).toContain(
      "style:minimalist"
    );
  });
});
