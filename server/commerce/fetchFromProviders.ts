/**
 * Fetch products from live providers only. No mock data.
 * Tries major retailers (Amazon, Walmart, Macy's) first, then Best Buy and configurable feed.
 */

import type { ProviderResult } from "../../shared/types";
import type { RawProduct } from "./providers/types";
import type { ClosetGap } from "../../shared/types";
import { AmazonProvider } from "./providers/amazonProvider";
import { WalmartProvider } from "./providers/walmartProvider";
import { MacysProvider } from "./providers/macysProvider";
import { BestBuyProvider } from "./providers/bestBuyProvider";
import { JsonFeedProvider } from "./providers/jsonFeedProvider";

export type FetchProductsOutcome =
  | { ok: true; products: RawProduct[]; source: string }
  | { ok: false; reason: string; code?: string };

const PROVIDERS = [
  () => new AmazonProvider(),
  () => new WalmartProvider(),
  () => new MacysProvider(),
  () => new BestBuyProvider(),
  () => new JsonFeedProvider(),
];

/**
 * Fetch real products from configured live providers, using gaps to guide category/query.
 * Never returns fake data. If no provider is available or all fail, returns ok: false.
 */
export async function fetchProductsFromLiveProviders(
  gaps: ClosetGap[],
  limitPerSource: number = 25
): Promise<FetchProductsOutcome> {
  const available = PROVIDERS.map((f) => f()).filter((p) => p.isAvailable());
  if (available.length === 0) {
    return {
      ok: false,
      reason:
        "No live product source is configured. Set one of: AMAZON_ACCESS_KEY/SECRET_KEY/PARTNER_TAG, WALMART_PUBLISHER_ID, MACYS_API_KEY, BEST_BUY_API_KEY, or COMMERCE_FEED_URL.",
      code: "UNAVAILABLE",
    };
  }

  const categories = [...new Set(gaps.flatMap((g) => g.targetCategories))];
  const primaryCategory = categories[0] ?? "top";

  for (const provider of available) {
    const result: ProviderResult<RawProduct[]> = await provider.fetchProducts({
      category: primaryCategory,
      query: primaryCategory,
      limit: limitPerSource,
    });

    if (result.ok && result.data.length > 0) {
      return { ok: true, products: result.data, source: result.source };
    }
  }

  return {
    ok: false,
    reason:
      "All configured product sources failed or returned no results. Check credentials and try again.",
    code: "ALL_FAILED",
  };
}
