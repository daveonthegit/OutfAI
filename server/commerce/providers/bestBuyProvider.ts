/**
 * Best Buy API product provider. Live data only.
 * Requires BEST_BUY_API_KEY. Returns explicit UNAVAILABLE when key is missing or API fails.
 * @see https://bestbuyapis.github.io/api-documentation/
 */

import type { ProviderResult } from "../../../shared/types";
import type { RawProduct } from "./types";
import type { IProductProvider } from "./types";

const BASE = "https://api.bestbuy.com/v1";
const SOURCE = "bestbuy";

/** Map our category to Best Buy search query (they are electronics-focused; we use general search). */
function categoryToSearchQuery(category: string): string {
  const map: Record<string, string> = {
    top: "clothing shirt",
    bottom: "pants jeans",
    shoes: "shoes sneakers",
    outerwear: "jacket coat",
    accessory: "watch bag",
  };
  return map[category] ?? category;
}

export class BestBuyProvider implements IProductProvider {
  readonly name = SOURCE;
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.BEST_BUY_API_KEY;
  }

  isAvailable(): boolean {
    return typeof this.apiKey === "string" && this.apiKey.length > 0;
  }

  async fetchProducts(options?: {
    category?: string;
    query?: string;
    limit?: number;
  }): Promise<ProviderResult<RawProduct[]>> {
    if (!this.isAvailable()) {
      return {
        ok: false,
        code: "UNAVAILABLE",
        message:
          "Best Buy API key not configured. Set BEST_BUY_API_KEY for live product data.",
        source: SOURCE,
      };
    }

    const limit = Math.min(options?.limit ?? 20, 30);
    const searchTerm =
      options?.query ?? categoryToSearchQuery(options?.category ?? "clothing");
    const encodedSearch = encodeURIComponent(searchTerm);
    const url = `${BASE}/products(search=${encodedSearch})?format=json&apiKey=${this.apiKey!}&pageSize=${limit}&show=sku,name,salePrice,image,url,manufacturer,categoryPath`;

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        if (res.status === 401)
          return {
            ok: false,
            code: "AUTH_REQUIRED",
            message: "Best Buy API key invalid or expired.",
            source: SOURCE,
          };
        if (res.status === 429)
          return {
            ok: false,
            code: "RATE_LIMITED",
            message: "Best Buy API rate limit exceeded.",
            source: SOURCE,
          };
        return {
          ok: false,
          code: "NETWORK_ERROR",
          message: `Best Buy API returned ${res.status}.`,
          source: SOURCE,
        };
      }

      const data = await res.json();
      const items = data?.products ?? [];
      if (!Array.isArray(items)) {
        return {
          ok: false,
          code: "PARSE_ERROR",
          message: "Best Buy API response missing products array.",
          source: SOURCE,
        };
      }

      const products: RawProduct[] = items.map((p: Record<string, unknown>) =>
        this.mapProduct(p)
      );
      return { ok: true, data: products, source: SOURCE };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Best Buy API request failed.";
      return { ok: false, code: "NETWORK_ERROR", message, source: SOURCE };
    }
  }

  private mapProduct(p: Record<string, unknown>): RawProduct {
    const sku = p.sku != null ? String(p.sku) : "";
    const name = typeof p.name === "string" ? p.name : "Unknown";
    const url = typeof p.url === "string" ? p.url : "";
    const image = typeof p.image === "string" ? p.image : undefined;
    const salePrice = typeof p.salePrice === "number" ? p.salePrice : undefined;
    const manufacturer =
      typeof p.manufacturer === "string" ? p.manufacturer : undefined;
    const categoryPath = p.categoryPath;
    let category = "accessory";
    if (Array.isArray(categoryPath) && categoryPath.length > 0) {
      const last = categoryPath[categoryPath.length - 1];
      const nameLower =
        typeof last === "object" &&
        last &&
        typeof (last as { name?: string }).name === "string"
          ? (last as { name: string }).name.toLowerCase()
          : "";
      if (
        nameLower.includes("cloth") ||
        nameLower.includes("shirt") ||
        nameLower.includes("top")
      )
        category = "top";
      else if (
        nameLower.includes("pant") ||
        nameLower.includes("jean") ||
        nameLower.includes("bottom")
      )
        category = "bottom";
      else if (nameLower.includes("shoe") || nameLower.includes("sneaker"))
        category = "shoes";
      else if (
        nameLower.includes("jacket") ||
        nameLower.includes("coat") ||
        nameLower.includes("outer")
      )
        category = "outerwear";
    }

    return {
      id: sku,
      source: SOURCE,
      retailer: "Best Buy",
      name,
      brand: manufacturer,
      category,
      price: salePrice,
      currency: "USD",
      imageUrl: image,
      productUrl: url || `https://www.bestbuy.com/site/-/${sku}.p`,
      availability: "in_stock",
    };
  }
}
