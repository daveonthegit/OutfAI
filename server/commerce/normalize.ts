/**
 * Normalize raw provider products into the shared ExternalProduct shape.
 * Handles category/color normalization and safe defaults.
 */

import type { ExternalProduct } from "../../shared/types";
import type { RawProduct } from "./providers/types";

const NORMALIZED_CATEGORIES = new Set([
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
]);

function normalizeCategory(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (NORMALIZED_CATEGORIES.has(lower)) return lower;
  const map: Record<string, string> = {
    blazer: "outerwear",
    coat: "outerwear",
    jacket: "outerwear",
    sweater: "top",
    tee: "top",
    shirt: "top",
    trousers: "bottom",
    pants: "bottom",
    jeans: "bottom",
    sneakers: "shoes",
    belt: "accessory",
    bag: "accessory",
  };
  return map[lower] ?? lower;
}

/** Normalize color for matching (lowercase, trim). */
function normalizeColor(color: string | undefined): string | undefined {
  if (!color || typeof color !== "string") return undefined;
  return color.toLowerCase().trim();
}

/**
 * Convert a raw provider product to ExternalProduct.
 * Caller supplies the stored document id (e.g. Convex id) if persisting.
 */
export function normalizeToExternalProduct(
  raw: RawProduct,
  documentId: string
): ExternalProduct {
  const now = Date.now();
  return {
    id: documentId,
    source: sanitizeString(raw.source, "unknown"),
    sourceProductId: sanitizeString(raw.id, ""),
    name: sanitizeString(raw.name, "Unknown Product"),
    brand: raw.brand ? sanitizeString(raw.brand, undefined) : undefined,
    category: normalizeCategory(raw.category),
    subcategory: raw.subcategory
      ? sanitizeString(raw.subcategory, undefined)
      : undefined,
    color: normalizeColor(raw.color),
    styleTags: Array.isArray(raw.styleTags)
      ? raw.styleTags.map((s) => sanitizeString(s, undefined))
      : undefined,
    occasionTags: Array.isArray(raw.occasionTags)
      ? raw.occasionTags.map((o) => sanitizeString(o, undefined))
      : undefined,
    price:
      typeof raw.price === "number" && raw.price >= 0 ? raw.price : undefined,
    currency: raw.currency
      ? sanitizeString(raw.currency, undefined)
      : undefined,
    imageUrl:
      raw.imageUrl && typeof raw.imageUrl === "string"
        ? raw.imageUrl
        : undefined,
    productUrl:
      typeof raw.productUrl === "string" && raw.productUrl
        ? raw.productUrl
        : "#",
    affiliateUrl:
      raw.affiliateUrl && typeof raw.affiliateUrl === "string"
        ? raw.affiliateUrl
        : undefined,
    availability: raw.availability
      ? sanitizeString(raw.availability, undefined)
      : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

function sanitizeString(value: unknown, fallback: string | undefined): string {
  if (typeof value !== "string") return fallback ?? "";
  return value.trim().slice(0, 2000);
}
