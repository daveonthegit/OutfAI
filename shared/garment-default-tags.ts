/**
 * Rules-based default tags for garments (F8 / issue #39).
 * Used when creating a garment or pre-filling the add-garment form.
 * No ML; category, color, and optional season drive suggestions.
 */

export type GarmentCategoryForTags =
  | "top"
  | "bottom"
  | "shoes"
  | "outerwear"
  | "accessory";

export type SeasonForTags =
  | "spring"
  | "summer"
  | "fall"
  | "winter"
  | "all-season";

const CATEGORY_TAGS: Record<GarmentCategoryForTags, string[]> = {
  top: ["casual", "everyday"],
  bottom: ["casual", "everyday"],
  shoes: ["everyday"],
  outerwear: ["layering", "everyday"],
  accessory: ["everyday"],
};

/**
 * Returns default tags for a garment based on category, primary color, and optional season.
 * Used to pre-fill the add-garment form and to default tags on the server when empty.
 */
export function getDefaultTagsForGarment(
  category: string,
  primaryColor: string,
  season?: string | null
): string[] {
  const tags = new Set<string>();

  const cat = category.toLowerCase() as GarmentCategoryForTags;
  if (CATEGORY_TAGS[cat]) {
    for (const t of CATEGORY_TAGS[cat]) {
      tags.add(t);
    }
  } else {
    tags.add("everyday");
  }

  const colorTag = primaryColor.trim().toLowerCase();
  if (colorTag) {
    tags.add(colorTag);
  }

  const seasonNorm = season?.trim().toLowerCase();
  if (
    seasonNorm &&
    ["spring", "summer", "fall", "winter", "all-season"].includes(seasonNorm)
  ) {
    tags.add(seasonNorm);
  }

  return Array.from(tags);
}
