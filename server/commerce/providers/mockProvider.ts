/**
 * Mock product provider for tests only. NOT used in production or in fetchFromProviders.
 * Products are curated to exercise recommendation logic (categories, colors, styles).
 * Application flows must use live providers only (Amazon, Walmart, Macy's, Best Buy, JSON feed).
 */

import type { ProviderResult } from "../../../shared/types";
import type { RawProduct } from "./types";
import type { IProductProvider } from "./types";

const MOCK_PRODUCTS: RawProduct[] = [
  {
    id: "mock-jacket-1",
    source: "mock",
    name: "Neutral Wool Blend Blazer",
    brand: "Mock Brand",
    category: "outerwear",
    subcategory: "blazer",
    color: "navy",
    styleTags: ["classic", "smart-casual"],
    occasionTags: ["work", "smart-casual"],
    price: 129.99,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
    productUrl: "https://example.com/p/mock-jacket-1",
    availability: "in_stock",
  },
  {
    id: "mock-shoes-1",
    source: "mock",
    name: "White Leather Sneakers",
    brand: "Mock Brand",
    category: "shoes",
    subcategory: "sneakers",
    color: "white",
    styleTags: ["casual", "minimalist"],
    occasionTags: ["casual", "weekend"],
    price: 89.99,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    productUrl: "https://example.com/p/mock-shoes-1",
    availability: "in_stock",
  },
  {
    id: "mock-top-1",
    source: "mock",
    name: "Striped Breton Top",
    brand: "Mock Brand",
    category: "top",
    subcategory: "tee",
    color: "navy",
    styleTags: ["casual", "classic"],
    occasionTags: ["casual", "weekend"],
    price: 49.99,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    productUrl: "https://example.com/p/mock-top-1",
    availability: "in_stock",
  },
  {
    id: "mock-outerwear-2",
    source: "mock",
    name: "Beige Trench Coat",
    brand: "Mock Brand",
    category: "outerwear",
    subcategory: "coat",
    color: "beige",
    styleTags: ["classic", "minimalist"],
    occasionTags: ["work", "smart-casual"],
    price: 199.99,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
    productUrl: "https://example.com/p/mock-outerwear-2",
    availability: "in_stock",
  },
  {
    id: "mock-accessory-1",
    source: "mock",
    name: "Leather Belt",
    brand: "Mock Brand",
    category: "accessory",
    subcategory: "belt",
    color: "brown",
    styleTags: ["classic"],
    occasionTags: ["casual", "formal"],
    price: 45.99,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=400",
    productUrl: "https://example.com/p/mock-accessory-1",
    availability: "in_stock",
  },
  {
    id: "mock-bottom-1",
    source: "mock",
    name: "Black Tailored Trousers",
    brand: "Mock Brand",
    category: "bottom",
    subcategory: "trousers",
    color: "black",
    styleTags: ["formal", "minimalist"],
    occasionTags: ["work", "formal"],
    price: 79.99,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
    productUrl: "https://example.com/p/mock-bottom-1",
    availability: "in_stock",
  },
];

export const MOCK_PROVIDER_NAME = "mock";

export class MockProductProvider implements IProductProvider {
  readonly name = MOCK_PROVIDER_NAME;

  isAvailable(): boolean {
    return true;
  }

  async fetchProducts(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ProviderResult<RawProduct[]>> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const slice = MOCK_PRODUCTS.slice(offset, offset + limit);
    return Promise.resolve({
      ok: true,
      data: slice,
      source: MOCK_PROVIDER_NAME,
    });
  }
}
