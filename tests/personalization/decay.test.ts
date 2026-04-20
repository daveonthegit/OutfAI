import { describe, expect, it } from "vitest";
import { applyDecay } from "../../convex/personalization/decay";

describe("applyDecay", () => {
  it("does not mutate input", () => {
    const input = {
      color: { black: -0.5 },
    };
    const before = JSON.stringify(input);
    applyDecay(input, 0.98, 0.02);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("multiplies and prunes small magnitudes", () => {
    const out = applyDecay(
      {
        color: { a: 0.5, b: 0.015 },
      },
      0.98,
      0.02
    );
    expect(out?.color?.a).toBeCloseTo(0.49);
    expect(out?.color?.b).toBeUndefined();
  });

  it("returns undefined for empty weights", () => {
    expect(applyDecay(undefined, 0.98)).toBeUndefined();
  });
});
