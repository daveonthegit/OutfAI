/**
 * Walmart Affiliate (Impact) API provider. Live data only.
 * Requires: WALMART_PUBLISHER_ID and (for signed requests) WALMART_CONSUMER_ID + WALMART_PRIVATE_KEY.
 * Returns explicit UNAVAILABLE when not configured or API fails.
 * @see https://affiliates.walmart.com/apidocs and https://www.walmart.io/reference
 */

import type { ProviderResult } from "../../../shared/types";
import type { RawProduct } from "./types";
import type { IProductProvider } from "./types";

const SOURCE = "walmart";
const AFFIL_BASE =
  "https://developer.api.walmart.com/api-proxy/service/affil/product/v2";
// Search endpoint path may vary by affiliate network; see walmart.io/reference and your program docs.

export class WalmartProvider implements IProductProvider {
  readonly name = SOURCE;
  private readonly publisherId: string | undefined;
  private readonly consumerId: string | undefined;
  private readonly privateKey: string | undefined;

  constructor(config?: {
    publisherId?: string;
    consumerId?: string;
    privateKey?: string;
  }) {
    this.publisherId = config?.publisherId ?? process.env.WALMART_PUBLISHER_ID;
    this.consumerId = config?.consumerId ?? process.env.WALMART_CONSUMER_ID;
    this.privateKey = config?.privateKey ?? process.env.WALMART_PRIVATE_KEY;
  }

  isAvailable(): boolean {
    return typeof this.publisherId === "string" && this.publisherId.length > 0;
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
          "Walmart affiliate API not configured. Set WALMART_PUBLISHER_ID (and WALMART_CONSUMER_ID, WALMART_PRIVATE_KEY for signed requests).",
        source: SOURCE,
      };
    }

    const query = (options?.query ?? options?.category ?? "clothing").replace(
      /\s+/g,
      "+"
    );
    const limit = Math.min(options?.limit ?? 20, 25);
    const url = `${AFFIL_BASE}/search?query=${encodeURIComponent(query)}&publisherId=${this.publisherId!}&numItems=${limit}`;

    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (this.consumerId && this.privateKey) {
        const timestamp = Date.now().toString();
        const signature = this.signRequest(url, timestamp);
        if (signature) {
          headers["WM_CONSUMER.ID"] = this.consumerId;
          headers["WM_CONSUMER.INTIMESTAMP"] = timestamp;
          headers["WM_SEC.KEY_VERSION"] = "1";
          headers["WM_SEC.AUTH_SIGNATURE"] = signature;
        }
      }

      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        if (res.status === 401)
          return {
            ok: false,
            code: "AUTH_REQUIRED",
            message: "Walmart API authentication failed.",
            source: SOURCE,
          };
        if (res.status === 429)
          return {
            ok: false,
            code: "RATE_LIMITED",
            message: "Walmart API rate limit exceeded.",
            source: SOURCE,
          };
        return {
          ok: false,
          code: "NETWORK_ERROR",
          message: `Walmart API returned ${res.status}.`,
          source: SOURCE,
        };
      }

      const data = (await res.json()) as {
        items?: Array<Record<string, unknown>>;
      };
      const items = Array.isArray(data?.items) ? data.items : [];
      const products: RawProduct[] = items.map((item) => this.mapItem(item));
      return { ok: true, data: products, source: SOURCE };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Walmart API request failed.";
      return { ok: false, code: "NETWORK_ERROR", message, source: SOURCE };
    }
  }

  private signRequest(url: string, timestamp: string): string | null {
    if (!this.privateKey || !this.consumerId) return null;
    try {
      const crypto = require("crypto");
      const sign = crypto.createSign("SHA256");
      sign.update(this.consumerId + "\n" + timestamp + "\n" + url + "\n");
      sign.end();
      return sign.sign(this.privateKey, "base64");
    } catch {
      return null;
    }
  }

  private mapItem(item: Record<string, unknown>): RawProduct {
    const id = String(item.itemId ?? item.productId ?? item.id ?? "");
    const name = String(item.name ?? item.productName ?? "Walmart product");
    const productUrl = String(
      item.productUrl ?? item.url ?? `https://www.walmart.com/ip/${id}`
    );
    const salePrice = item.salePrice ?? item.price;
    const price = typeof salePrice === "number" ? salePrice : undefined;
    const imageUrl = item.mediumImage ?? item.largeImage ?? item.imageUrl;
    const image = typeof imageUrl === "string" ? imageUrl : undefined;
    const brand =
      typeof item.brandName === "string" ? item.brandName : undefined;
    const categoryPath = item.categoryPath;
    let category = "top";
    if (typeof categoryPath === "string") {
      const lower = categoryPath.toLowerCase();
      if (lower.includes("shoe") || lower.includes("footwear"))
        category = "shoes";
      else if (
        lower.includes("jacket") ||
        lower.includes("coat") ||
        lower.includes("outer")
      )
        category = "outerwear";
      else if (
        lower.includes("pant") ||
        lower.includes("jean") ||
        lower.includes("bottom")
      )
        category = "bottom";
      else if (
        lower.includes("bag") ||
        lower.includes("belt") ||
        lower.includes("accessor")
      )
        category = "accessory";
    }

    return {
      id,
      source: SOURCE,
      retailer: "Walmart",
      name,
      brand,
      category,
      price,
      currency: "USD",
      imageUrl: image,
      productUrl,
      availability: "in_stock",
    };
  }
}
