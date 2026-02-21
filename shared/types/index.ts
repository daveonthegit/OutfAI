// Shared types — used by apps/web and server to prevent type drift

export type GarmentCategory =
  | "tops"
  | "bottoms"
  | "shoes"
  | "outerwear"
  | "accessories";

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
  season: Season;
  imageUrl?: string;
  tags: string[];
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

export interface RecommendationInput {
  userId: string;
  mood?: Mood;
  weather?: WeatherCondition;
  temperature?: number;
  occasion?: string;
  limitCount?: number;
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
