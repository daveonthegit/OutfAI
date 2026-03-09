/**
 * Amazon Product Advertising API 5.0 (PA-API) provider. Live data only.
 * Requires: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG.
 * Returns explicit UNAVAILABLE when credentials are missing or API fails.
 * @see https://webservices.amazon.com/paapi5/documentation/
 * Note: PA-API is deprecated April 2026; migrate to Creators API when available.
 */

import type { ProviderResult } from "../../../shared/types";
import type { RawProduct } from "./types";
import type { IProductProvider } from "./types";

const SOURCE = "amazon";

/** Map our category to Amazon search keywords (SearchIndex "All" or "Fashion" where applicable). */
function categoryToKeywords(category: string): string {
  const map: Record<string, string> = {
    top: "women casual top",
    bottom: "women pants jeans",
    shoes: "women sneakers shoes",
    outerwear: "women jacket coat",
    accessory: "women bag belt",
  };
  return map[category] ?? `${category} clothing`;
}

export class AmazonProvider implements IProductProvider {
  readonly name = SOURCE;
  private readonly accessKey: string | undefined;
  private readonly secretKey: string | undefined;
  private readonly partnerTag: string | undefined;

  constructor(config?: {
    accessKey?: string;
    secretKey?: string;
    partnerTag?: string;
  }) {
    this.accessKey = config?.accessKey ?? process.env.AMAZON_ACCESS_KEY;
    this.secretKey = config?.secretKey ?? process.env.AMAZON_SECRET_KEY;
    this.partnerTag = config?.partnerTag ?? process.env.AMAZON_PARTNER_TAG;
  }

  isAvailable(): boolean {
    return !!(
      typeof this.accessKey === "string" &&
      this.accessKey.length > 0 &&
      typeof this.secretKey === "string" &&
      this.secretKey.length > 0 &&
      typeof this.partnerTag === "string" &&
      this.partnerTag.length > 0
    );
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
          "Amazon PA-API credentials not configured. Set AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_PARTNER_TAG.",
        source: SOURCE,
      };
    }

    try {
      const ProductAdvertisingAPIv1 = require("paapi5-nodejs-sdk");
      const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
      defaultClient.accessKey = this.accessKey;
      defaultClient.secretKey = this.secretKey;
      defaultClient.host = "webservices.amazon.com";
      defaultClient.region = "us-east-1";

      const api = new ProductAdvertisingAPIv1.DefaultApi();
      const searchItemsRequest =
        new ProductAdvertisingAPIv1.SearchItemsRequest();
      searchItemsRequest["PartnerTag"] = this.partnerTag;
      searchItemsRequest["PartnerType"] = "Associates";
      searchItemsRequest["Keywords"] =
        options?.query ?? categoryToKeywords(options?.category ?? "top");
      searchItemsRequest["SearchIndex"] = "All";
      searchItemsRequest["ItemCount"] = Math.min(options?.limit ?? 20, 10);
      searchItemsRequest["Resources"] = [
        "Images.Primary.Medium",
        "ItemInfo.Title",
        "Offers.Listings.Price",
        "ItemInfo.ByLineInfo",
      ];

      const data = await new Promise<unknown>((resolve, reject) => {
        api.searchItems(searchItemsRequest, (err: Error | null, d: unknown) => {
          if (err) reject(err);
          else resolve(d);
        });
      });

      const response = data as {
        SearchResult?: { Items?: Array<Record<string, unknown>> };
        Errors?: Array<{ Code?: string; Message?: string }>;
      };

      if (response.Errors?.length) {
        const first = response.Errors[0];
        const code = first?.Code ?? "API_ERROR";
        const msg = first?.Message ?? "Amazon PA-API returned errors.";
        if (code === "InvalidParameterValue" || code === "TooManyRequests")
          return {
            ok: false,
            code: "RATE_LIMITED",
            message: msg,
            source: SOURCE,
          };
        return { ok: false, code: "PARSE_ERROR", message: msg, source: SOURCE };
      }

      const items = response.SearchResult?.Items ?? [];
      const products: RawProduct[] = items.map((item) => this.mapItem(item));
      return { ok: true, data: products, source: SOURCE };
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message =
        err instanceof Error ? err.message : "Amazon PA-API request failed.";
      if (status === 401)
        return {
          ok: false,
          code: "AUTH_REQUIRED",
          message: "Amazon PA-API credentials invalid or expired.",
          source: SOURCE,
        };
      if (status === 429)
        return {
          ok: false,
          code: "RATE_LIMITED",
          message: "Amazon PA-API rate limit exceeded.",
          source: SOURCE,
        };
      return { ok: false, code: "NETWORK_ERROR", message, source: SOURCE };
    }
  }

  private mapItem(item: Record<string, unknown>): RawProduct {
    const asin = (item.ASIN as string) ?? "";
    const title = (item.ItemInfo as Record<string, unknown>)?.Title as
      | Record<string, unknown>
      | undefined;
    const name =
      (title?.DisplayValue as string) ??
      (item.DetailPageURL as string)?.slice(0, 50) ??
      "Amazon product";
    const url =
      (item.DetailPageURL as string) ?? `https://www.amazon.com/dp/${asin}`;
    const byline = (item.ItemInfo as Record<string, unknown>)?.ByLineInfo as
      | Record<string, unknown>
      | undefined;
    const brandObj = byline?.Brand as Record<string, unknown> | undefined;
    const brand = brandObj?.DisplayValue as string | undefined;
    const listings = (item.Offers as Record<string, unknown>)?.Listings as
      | Array<Record<string, unknown>>
      | undefined;
    const priceListing = listings?.[0];
    const priceObj = priceListing?.Price as Record<string, unknown> | undefined;
    const amount = priceObj?.DisplayAmount as string | undefined;
    const price = amount
      ? parseFloat(amount.replace(/[^0-9.]/g, ""))
      : undefined;
    const images = item.Images as Record<string, unknown> | undefined;
    const primary = images?.Primary as Record<string, unknown> | undefined;
    const medium = primary?.Medium as Record<string, unknown> | undefined;
    const imageUrl = medium?.URL as string | undefined;

    return {
      id: asin,
      source: SOURCE,
      retailer: "Amazon",
      name,
      brand,
      category: "top",
      price:
        typeof price === "number" && !Number.isNaN(price) ? price : undefined,
      currency: "USD",
      imageUrl,
      productUrl: url,
      availability: "in_stock",
    };
  }
}
