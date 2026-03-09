/**
 * Macy's Catalog API provider. Live data only.
 * Requires: MACYS_API_KEY (x-macys-webservice-client-id). API access is for approved partners.
 * Returns explicit UNAVAILABLE when key is missing or API fails.
 * @see https://developer.macys.com/docs (Category Browse Product v3)
 */

import type { ProviderResult } from "../../../shared/types";
import type { RawProduct } from "./types";
import type { IProductProvider } from "./types";

const SOURCE = "macys";
const BASE = "https://api.macys.com/v3/catalog";

/** Macy's category IDs for apparel (from their catalog). Browse products in these categories. */
const CATEGORY_IDS: Record<string, number> = {
  top: 21682,
  bottom: 3016,
  shoes: 25613,
  outerwear: 26286,
  accessory: 26134,
  default: 3016,
};

export class MacysProvider implements IProductProvider {
  readonly name = SOURCE;
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.MACYS_API_KEY;
  }

  isAvailable(): boolean {
    return typeof this.apiKey === "string" && this.apiKey.length > 0;
  }

  async fetchProducts(options?: {
    category?: string;
    limit?: number;
  }): Promise<ProviderResult<RawProduct[]>> {
    if (!this.isAvailable()) {
      return {
        ok: false,
        code: "UNAVAILABLE",
        message:
          "Macy's API key not configured. Set MACYS_API_KEY. (API access is for approved Macy's partners.)",
        source: SOURCE,
      };
    }

    const categoryId = options?.category
      ? (CATEGORY_IDS[options.category] ?? CATEGORY_IDS.default)
      : CATEGORY_IDS.default;
    const limit = Math.min(options?.limit ?? 20, 24);
    const url = `${BASE}/category/${categoryId}/browseproducts?currentpage=1&resultsperpage=${limit}&sortby=bestseller&imagewidth=300&imagequality=90`;

    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "x-macys-webservice-client-id": this.apiKey!,
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        if (res.status === 401)
          return {
            ok: false,
            code: "AUTH_REQUIRED",
            message: "Macy's API key invalid or expired.",
            source: SOURCE,
          };
        if (res.status === 429)
          return {
            ok: false,
            code: "RATE_LIMITED",
            message: "Macy's API rate limit exceeded.",
            source: SOURCE,
          };
        return {
          ok: false,
          code: "NETWORK_ERROR",
          message: `Macy's API returned ${res.status}.`,
          source: SOURCE,
        };
      }

      const data = (await res.json()) as {
        category?: Array<{
          products?: Array<Record<string, unknown>>;
          product?: Array<Record<string, unknown>>;
        }>;
      };
      const categories = data?.category ?? [];
      const productLists = categories.flatMap(
        (c) => c.products ?? c.product ?? []
      );
      const products: RawProduct[] = productLists
        .filter(
          (p): p is Record<string, unknown> =>
            typeof p === "object" && p !== null
        )
        .map((p) => this.mapItem(p));
      return { ok: true, data: products, source: SOURCE };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Macy's API request failed.";
      return { ok: false, code: "NETWORK_ERROR", message, source: SOURCE };
    }
  }

  private mapItem(item: Record<string, unknown>): RawProduct {
    const id = String(item.id ?? item.productId ?? item.upc ?? "");
    const summary = item.summary as Record<string, unknown> | undefined;
    const name = String(
      summary?.name ?? item.name ?? item.productName ?? "Macy's product"
    );
    const productUrl = String(
      summary?.productURL ??
        item.productUrl ??
        item.url ??
        `https://www.macys.com/shop/product/${id}`
    );
    const priceObj = item.price as Record<string, unknown> | undefined;
    const retail = priceObj?.retail as Record<string, unknown> | undefined;
    const priceVal = retail?.pricevalue as Record<string, unknown> | undefined;
    const price = priceVal?.low as number | undefined;
    const imageSource =
      summary?.primaryPortraitSource ?? item.imageUrl ?? item.primaryImage;
    const imageUrl =
      typeof imageSource === "string"
        ? `https://slimages.macys.com/is/image/MCY/products/${imageSource}`
        : undefined;

    return {
      id,
      source: SOURCE,
      retailer: "Macy's",
      name,
      category: "top",
      price: typeof price === "number" ? price : undefined,
      currency: "USD",
      imageUrl,
      productUrl,
      availability: "in_stock",
    };
  }
}
