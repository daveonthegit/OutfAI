import { describe, it, expect } from "vitest";
import { toggleStringInList } from "./toggle-string-in-list";

describe("toggleStringInList", () => {
  it("adds value when absent", () => {
    expect(toggleStringInList("a", [])).toEqual(["a"]);
    expect(toggleStringInList("b", ["a"])).toEqual(["a", "b"]);
  });

  it("removes value when present", () => {
    expect(toggleStringInList("a", ["a", "b"])).toEqual(["b"]);
    expect(toggleStringInList("a", ["a"])).toEqual([]);
  });
});
