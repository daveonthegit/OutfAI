// Shared types — used by apps/web and server to prevent type drift

export type GarmentCategory =
  | "top"
  | "bottom"
  | "shoes"
  | "outerwear"
  | "accessory";

export type Season = "spring" | "summer" | "fall" | "winter" | "all-season";

export type Mood =
  | "casual"
  | "formal"
  | "adventurous"
  | "cozy"
  | "energetic"
  | "minimalist"
  | "bold";

export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "foggy"
  | "windy"
  | "hot"
  | "cold";

export interface Garment {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  primaryColor: string;
  secondaryColor?: string;
  material?: string;
  season?: Season;
  imageUrl?: string;
  imageOriginalUrl?: string;
  tags: string[];
  style?: string[];
  fit?: string;
  occasion?: string[];
  versatility?: "high" | "medium" | "low";
  vibrancy?: "muted" | "balanced" | "vibrant";
  createdAt: Date;
}

export interface Outfit {
  id: string;
  userId: string;
  garmentIds: string[];
  contextWeather?: WeatherCondition;
  contextMood?: Mood;
  explanation: string;
  score: number;
  createdAt: Date;
}

export interface ExplicitStylePreferences {
  favoriteMoods?: Mood[];
  preferredStyles?: string[];
  preferredColors?: string[];
  avoidedColors?: string[];
}

export interface LearnedStylePreferences {
  favoriteMoods?: Mood[];
  preferredStyles?: string[];
  preferredColors?: string[];
}

export interface UserStylePreferences {
  explicit?: ExplicitStylePreferences;
  learned?: LearnedStylePreferences;
}

export interface RecommendationInput {
  userId: string;
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  occasion?: string;
  limitCount?: number;
  preferences?: UserStylePreferences;
}

export interface RecommendationOutput {
  outfits: Outfit[];
  explanation: string;
  totalGenerated: number;
}

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  humidity?: number;
  windSpeed?: number;
}

export type RecommendationLog = {
  id: string;
  userId: string;
  outfitId: string;
  action: "shown" | "saved" | "skipped" | "worn";
  timestamp: Date;
};

// --- Commerce / external product types (wardrobe-first recommendations) ---

/** Result of a live product provider fetch. No fake data. */
export type ProviderResult<T> =
  | { ok: true; data: T; source: string }
  | {
      ok: false;
      code:
        | "UNAVAILABLE"
        | "AUTH_REQUIRED"
        | "RATE_LIMITED"
        | "NETWORK_ERROR"
        | "PARSE_ERROR";
      message: string;
      source?: string;
    };

/** Structured closet gap for recommendation engine. */
export type ClosetGapType =
  | "missing_staple"
  | "missing_neutral_layer"
  | "missing_versatile_shoes"
  | "missing_formal_shoes"
  | "missing_weather_outerwear"
  | "weak_formal_coverage"
  | "weak_category_coverage"
  | "insufficient_basics";

export interface ClosetGap {
  gapType: ClosetGapType;
  severity: "high" | "medium" | "low";
  targetCategories: GarmentCategory[];
  targetColors?: string[];
  styleOccasionContext?: string[];
  supportingGarmentIds: string[];
  explanation: string;
}

export interface ExternalProduct {
  id: string;
  source: string;
  sourceProductId: string;
  /** Retailer or brand display name (e.g. "Best Buy", "Nordstrom") */
  retailer?: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  /** Normalized for matching (e.g. top, bottom, shoes) */
  normalizedCategory?: string;
  color?: string;
  normalizedColor?: string;
  styleTags?: string[];
  occasionTags?: string[];
  price?: number;
  currency?: string;
  imageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  availability?: string;
  rating?: number;
  createdAt: number;
  updatedAt: number;
}

export type ProductRecommendationSourceContext =
  | "wardrobe-gap"
  | "color-match"
  | "layering"
  | "style-alignment"
  | "occasion"
  | "versatile-piece";

export interface ProductRecommendation {
  product: ExternalProduct;
  reason: string;
  score: number;
  matchedGarmentIds: string[];
  sourceContext: ProductRecommendationSourceContext;
}

export interface ProductRecommendationInput {
  userId: string;
  garments: Garment[];
  /** Current outfit garment IDs (optional context) */
  outfitGarmentIds?: string[];
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  occasion?: string;
  limitCount?: number;
}

export type ProviderStatus =
  | { available: true }
  | { available: false; reason: string; code?: string };

export interface ProductRecommendationOutput {
  recommendations: ProductRecommendation[];
  /** Set when no live provider could supply products; no fake data returned. */
  providerStatus?: ProviderStatus;
}
