import { describe, expect, it } from "vitest";
import { generateCandidates } from "../../convex/recommendations/candidates";
import type { Doc, Id } from "../../convex/_generated/dataModel";

function garment(
  partial: Partial<Doc<"garments">> & Pick<Doc<"garments">, "_id" | "category">
): Doc<"garments"> {
  return {
    _creationTime: 0,
    userId: "u" as Id<"users">,
    name: "x",
    primaryColor: "black",
    tags: [],
    ...partial,
  } as Doc<"garments">;
}

describe("generateCandidates", () => {
  const ctx = { mood: "casual", weather: "sunny", temperature: 20 };

  it("returns empty when any required category is missing", () => {
    const onlyTops = [
      garment({ _id: "t1" as Id<"garments">, category: "top" }),
      garment({ _id: "t2" as Id<"garments">, category: "top" }),
    ];
    expect(generateCandidates(onlyTops, ctx)).toEqual([]);

    const noShoes = [
      garment({ _id: "t1" as Id<"garments">, category: "top" }),
      garment({ _id: "b1" as Id<"garments">, category: "bottom" }),
    ];
    expect(generateCandidates(noShoes, ctx)).toEqual([]);
  });

  it("returns outfits with top, bottom, shoes and caps at MAX_CANDIDATES", () => {
    const all: Doc<"garments">[] = [];
    for (let i = 0; i < 3; i++) {
      all.push(
        garment({
          _id: `t${i}` as Id<"garments">,
          category: "top",
          name: `top-${i}`,
        })
      );
    }
    for (let i = 0; i < 3; i++) {
      all.push(
        garment({
          _id: `b${i}` as Id<"garments">,
          category: "bottom",
          name: `bot-${i}`,
        })
      );
    }
    for (let i = 0; i < 3; i++) {
      all.push(
        garment({
          _id: `s${i}` as Id<"garments">,
          category: "shoes",
          name: `shoe-${i}`,
        })
      );
    }

    const out = generateCandidates(all, ctx);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(30);
    for (const o of out) {
      expect(o.garmentIds).toHaveLength(3);
      expect(o.garments.map((g) => g.category).sort()).toEqual([
        "bottom",
        "shoes",
        "top",
      ]);
    }
  });
});
