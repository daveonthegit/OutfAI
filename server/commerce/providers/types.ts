/**
 * Commerce product provider abstraction.
 * Production path: real retailer/affiliate APIs and feeds only.
 * No mock provider in app flows; providers return ProviderResult and fail explicitly when unavailable.
 */

import type { ProviderResult } from "../../../shared/types";

export interface RawProduct {
  id: string;
  source: string;
  /** Retailer display name (e.g. "Best Buy") */
  retailer?: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  color?: string;
  styleTags?: string[];
  occasionTags?: string[];
  price?: number;
  currency?: string;
  imageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  availability?: string;
  rating?: number;
  raw?: unknown;
}

export interface FetchProductsOptions {
  /** Target category for gap-filling (e.g. shoes, outerwear) */
  category?: string;
  /** Search query for product APIs */
  query?: string;
  limit?: number;
  offset?: number;
}

export interface IProductProvider {
  readonly name: string;
  /** Fetch real products. Returns ProviderResult; never returns fake data. */
  fetchProducts(
    options?: FetchProductsOptions
  ): Promise<ProviderResult<RawProduct[]>>;
  /** True only when credentials/source are configured and the provider can be called. */
  isAvailable(): boolean;
}
