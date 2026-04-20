import type { Mood } from "@shared/types";

export const VALID_HOME_MOODS: Mood[] = [
  "casual",
  "formal",
  "adventurous",
  "cozy",
  "energetic",
  "minimalist",
  "bold",
];

export function isHomeMood(value: string | null): value is Mood {
  return value !== null && (VALID_HOME_MOODS as string[]).includes(value);
}
