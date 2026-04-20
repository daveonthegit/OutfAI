import { describe, expect, it } from "vitest";
import { extractSignalsFromLog } from "../../convex/personalization/signals";
import type { Doc, Id } from "../../convex/_generated/dataModel";

function garment(
  partial: Partial<Doc<"garments">> & Pick<Doc<"garments">, "_id" | "userId">
): Doc<"garments"> {
  return {
    _creationTime: 0,
    name: "x",
    category: "top",
    primaryColor: "Black",
    tags: [],
    ...partial,
  } as Doc<"garments">;
}

describe("extractSignalsFromLog", () => {
  it("returns empty for shown", () => {
    const g = garment({
      _id: "k1" as Id<"garments">,
      userId: "u1",
      style: ["minimalist"],
    });
    expect(extractSignalsFromLog({ action: "shown" }, [g])).toEqual([]);
  });

  it("splits saved delta across style tags", () => {
    const g = garment({
      _id: "k1" as Id<"garments">,
      userId: "u1",
      style: ["a", "b"],
      tags: [],
    });
    const signals = extractSignalsFromLog({ action: "saved" }, [g]);
    const styles = signals.filter((s) => s.dim === "style");
    expect(styles).toHaveLength(2);
    expect(styles[0]?.delta).toBeCloseTo(0.08 / 2);
    expect(styles[1]?.delta).toBeCloseTo(0.08 / 2);
  });

  it("uses strongest delta for worn", () => {
    const g = garment({
      _id: "k1" as Id<"garments">,
      userId: "u1",
      primaryColor: "navy",
    });
    const signals = extractSignalsFromLog({ action: "worn" }, [g]);
    const color = signals.find((s) => s.dim === "color");
    expect(color?.delta).toBeCloseTo(0.15);
  });

  it("applies negative delta for skipped", () => {
    const g = garment({
      _id: "k1" as Id<"garments">,
      userId: "u1",
      primaryColor: "red",
    });
    const signals = extractSignalsFromLog({ action: "skipped" }, [g]);
    expect(signals.find((s) => s.dim === "color")?.delta).toBeCloseTo(-0.05);
  });
});
