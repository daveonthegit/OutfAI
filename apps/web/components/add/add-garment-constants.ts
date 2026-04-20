export type AddCategory =
  | "top"
  | "bottom"
  | "shoes"
  | "outerwear"
  | "accessory";

export const ADD_CATEGORIES: AddCategory[] = [
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
];

export const ADD_COLORS = [
  "Black",
  "White",
  "Grey",
  "Navy",
  "Brown",
  "Cream",
  "Indigo",
  "Olive",
  "Red",
  "Blue",
  "Green",
  "Beige",
  "Pink",
  "Yellow",
];

export const STYLE_OPTIONS = [
  "minimalist",
  "classic",
  "bold",
  "trendy",
  "avant-garde",
  "casual",
];

export const FIT_OPTIONS = ["oversized", "fitted", "relaxed", "tapered"];

export const OCCASION_OPTIONS = [
  "casual",
  "formal",
  "work",
  "weekend",
  "night",
  "smart-casual",
];

export const VERSATILITY_OPTIONS = ["high", "medium", "low"] as const;
export const VIBRANCY_OPTIONS = ["muted", "balanced", "vibrant"] as const;
