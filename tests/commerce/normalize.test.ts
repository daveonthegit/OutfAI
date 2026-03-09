import { describe, it, expect } from "vitest";
import { normalizeToExternalProduct } from "../../server/commerce/normalize";
import type { RawProduct } from "../../server/commerce/providers/types";

describe("normalizeToExternalProduct", () => {
  it("maps required fields and assigns id", () => {
    const raw: RawProduct = {
      id: "ext-1",
      source: "mock",
      name: "Test Jacket",
      category: "outerwear",
      productUrl: "https://example.com/p/1",
    };
    const out = normalizeToExternalProduct(raw, "doc-id-1");
    expect(out.id).toBe("doc-id-1");
    expect(out.source).toBe("mock");
    expect(out.sourceProductId).toBe("ext-1");
    expect(out.name).toBe("Test Jacket");
    expect(out.category).toBe("outerwear");
    expect(out.productUrl).toBe("https://example.com/p/1");
    expect(out.createdAt).toBeDefined();
    expect(out.updatedAt).toBeDefined();
  });

  it("normalizes category (blazer -> outerwear)", () => {
    const raw: RawProduct = {
      id: "b1",
      source: "mock",
      name: "Blazer",
      category: "blazer",
      productUrl: "https://example.com/b1",
    };
    const out = normalizeToExternalProduct(raw, "id");
    expect(out.category).toBe("outerwear");
  });

  it("normalizes color to lowercase", () => {
    const raw: RawProduct = {
      id: "c1",
      source: "mock",
      name: "Shirt",
      category: "top",
      color: "Navy",
      productUrl: "https://example.com/c1",
    };
    const out = normalizeToExternalProduct(raw, "id");
    expect(out.color).toBe("navy");
  });

  it("sanitizes invalid productUrl to fallback", () => {
    const raw: RawProduct = {
      id: "x",
      source: "mock",
      name: "X",
      category: "top",
      productUrl: "",
    };
    const out = normalizeToExternalProduct(raw, "id");
    expect(out.productUrl).toBe("#");
  });

  it("handles optional price and currency", () => {
    const raw: RawProduct = {
      id: "p1",
      source: "mock",
      name: "Item",
      category: "top",
      productUrl: "https://example.com/p1",
      price: 49.99,
      currency: "USD",
    };
    const out = normalizeToExternalProduct(raw, "id");
    expect(out.price).toBe(49.99);
    expect(out.currency).toBe("USD");
  });

  it("ignores negative price", () => {
    const raw: RawProduct = {
      id: "p2",
      source: "mock",
      name: "Item",
      category: "top",
      productUrl: "https://example.com/p2",
      price: -1,
    };
    const out = normalizeToExternalProduct(raw, "id");
    expect(out.price).toBeUndefined();
  });

  it("deduplicates source product when same source+sourceProductId", () => {
    const raw: RawProduct = {
      id: "dup-1",
      source: "affiliate",
      sourceProductId: "dup-1",
      name: "Same",
      category: "top",
      productUrl: "https://example.com/dup",
    };
    const a = normalizeToExternalProduct(raw, "doc-a");
    const b = normalizeToExternalProduct(raw, "doc-b");
    expect(a.sourceProductId).toBe(b.sourceProductId);
    expect(a.id).toBe("doc-a");
    expect(b.id).toBe("doc-b");
  });
});
