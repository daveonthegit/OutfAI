import type { Mood } from "@shared/types";

export const DISPLAY_NAME_MAX_LENGTH = 100;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";
export const STYLE_GOAL_MAX_LENGTH = 200;

export const PROFILE_MOODS: Mood[] = [
  "casual",
  "formal",
  "adventurous",
  "cozy",
  "energetic",
  "minimalist",
  "bold",
];

export const PREFERRED_STYLE_CHIPS = [
  "minimalist",
  "bold",
  "classic",
  "trendy",
  "cozy",
] as const;

export const COLOR_CHIPS = [
  "black",
  "white",
  "gray",
  "navy",
  "beige",
  "red",
  "blue",
] as const;
