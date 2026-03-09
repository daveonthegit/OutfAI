import { describe, it, expect } from "vitest";
import {
  parseUsername,
  validateUsername,
  RESERVED_USERNAMES,
  USERNAME_MAX_LENGTH,
} from "./username";

describe("username validation", () => {
  describe("parseUsername", () => {
    it("accepts valid usernames and normalizes to lowercase", () => {
      expect(parseUsername("alice")).toEqual({ success: true, value: "alice" });
      expect(parseUsername("Alice")).toEqual({ success: true, value: "alice" });
      expect(parseUsername("bob_42")).toEqual({
        success: true,
        value: "bob_42",
      });
      expect(parseUsername("user.name")).toEqual({
        success: true,
        value: "user.name",
      });
      expect(parseUsername("  trimmed  ")).toEqual({
        success: true,
        value: "trimmed",
      });
    });

    it("rejects too short", () => {
      const r = parseUsername("ab");
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error).toContain("at least");
    });

    it("rejects too long", () => {
      const r = parseUsername("a".repeat(USERNAME_MAX_LENGTH + 1));
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error).toContain("at most");
    });

    it("rejects invalid characters", () => {
      expect(parseUsername("user-name").success).toBe(false);
      expect(parseUsername("user name").success).toBe(false);
      expect(parseUsername("user@mail").success).toBe(false);
    });

    it("rejects reserved usernames", () => {
      for (const reserved of ["admin", "Admin", "OUTFAI", "support"]) {
        const r = parseUsername(reserved);
        expect(r.success).toBe(false);
        if (!r.success) expect(r.error).toContain("reserved");
      }
    });
  });

  describe("validateUsername", () => {
    it("returns normalized value for valid input", () => {
      expect(validateUsername("ValidUser")).toBe("validuser");
    });

    it("throws for invalid input", () => {
      expect(() => validateUsername("ab")).toThrow();
      expect(() => validateUsername("admin")).toThrow();
    });
  });

  describe("RESERVED_USERNAMES", () => {
    it("includes expected entries", () => {
      expect(RESERVED_USERNAMES.has("admin")).toBe(true);
      expect(RESERVED_USERNAMES.has("outfai")).toBe(true);
      expect(RESERVED_USERNAMES.has("support")).toBe(true);
    });
  });
});
