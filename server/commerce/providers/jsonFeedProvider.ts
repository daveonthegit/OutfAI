/**
 * Configurable JSON feed provider. Live data only.
 * Fetches from COMMERCE_FEED_URL. Returns explicit UNAVAILABLE when URL is not set or fetch fails.
 * Expects JSON: array of products or { products: [] }. Each item: id, name, category, productUrl at minimum.
 */

import type { ProviderResult } from "../../../shared/types";
import type { RawProduct } from "./types";
import type { IProductProvider } from "./types";

const SOURCE = "json_feed";

function isProductLike(o: unknown): o is Record<string, unknown> {
  return (
    typeof o === "object" &&
    o !== null &&
    typeof (o as Record<string, unknown>).name === "string" &&
    typeof (o as Record<string, unknown>).productUrl === "string"
  );
}

export class JsonFeedProvider implements IProductProvider {
  readonly name = SOURCE;
  private readonly feedUrl: string | undefined;

  constructor(feedUrl?: string) {
    this.feedUrl = feedUrl ?? process.env.COMMERCE_FEED_URL;
  }

  isAvailable(): boolean {
    if (typeof this.feedUrl !== "string" || !this.feedUrl.startsWith("http"))
      return false;
    return true;
  }

  async fetchProducts(options?: {
    limit?: number;
  }): Promise<ProviderResult<RawProduct[]>> {
    if (!this.isAvailable()) {
      return {
        ok: false,
        code: "UNAVAILABLE",
        message:
          "Commerce feed URL not configured. Set COMMERCE_FEED_URL for live product data.",
        source: SOURCE,
      };
    }

    try {
      const res = await fetch(this.feedUrl!, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return {
          ok: false,
          code: "NETWORK_ERROR",
          message: `Feed returned ${res.status}.`,
          source: SOURCE,
        };
      }

      const json = await res.json();
      const rawList = Array.isArray(json) ? json : (json?.products ?? []);
      if (!Array.isArray(rawList)) {
        return {
          ok: false,
          code: "PARSE_ERROR",
          message: "Feed response is not an array or { products: [] }.",
          source: SOURCE,
        };
      }

      const products: RawProduct[] = [];
      const limit = Math.min(options?.limit ?? 50, 100);
      for (let i = 0; i < rawList.length && products.length < limit; i++) {
        const item = rawList[i];
        if (isProductLike(item)) {
          const p = this.normalizeItem(item);
          if (p) products.push(p);
        }
      }

      return { ok: true, data: products, source: SOURCE };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Commerce feed request failed.";
      return { ok: false, code: "NETWORK_ERROR", message, source: SOURCE };
    }
  }

  private normalizeItem(item: Record<string, unknown>): RawProduct | null {
    const id = item.id != null ? String(item.id) : undefined;
    const name = String(item.name ?? "");
    const productUrl = String(item.productUrl ?? item.url ?? "");
    if (!name || !productUrl || productUrl === "undefined") return null;

    return {
      id: id ?? `feed-${name.slice(0, 20)}-${Date.now()}`,
      source: SOURCE,
      retailer: typeof item.retailer === "string" ? item.retailer : undefined,
      name,
      brand: typeof item.brand === "string" ? item.brand : undefined,
      category: typeof item.category === "string" ? item.category : "top",
      subcategory:
        typeof item.subcategory === "string" ? item.subcategory : undefined,
      color: typeof item.color === "string" ? item.color : undefined,
      price: typeof item.price === "number" ? item.price : undefined,
      currency: typeof item.currency === "string" ? item.currency : undefined,
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
      productUrl,
      affiliateUrl:
        typeof item.affiliateUrl === "string" ? item.affiliateUrl : undefined,
      availability:
        typeof item.availability === "string" ? item.availability : undefined,
    };
  }
}
