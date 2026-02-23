import { Garment, Season } from "@/../../shared/types";

interface ClosetItem {
  id: string;
  src: string;
  name: string;
  category: "top" | "bottom" | "shoes" | "outerwear";
  color: string;
  traits?: {
    style: string[];
    fit: string;
    occasion: string[];
    versatility: "high" | "medium" | "low";
    vibrancy: "muted" | "balanced" | "vibrant";
  };
}

/**
 * Convert closet item to Garment format for recommendation engine
 */
export function closetItemToGarment(item: ClosetItem, userId: string): Garment {
  // Map closet categories to Garment categories
  const categoryMap: Record<ClosetItem["category"], any> = {
    top: "tops",
    bottom: "bottoms",
    shoes: "shoes",
    outerwear: "outerwear",
  };

  // Infer season from category and color/material hints
  const inferSeason = (name: string, category: string): Season => {
    const nameLower = name.toLowerCase();

    if (
      nameLower.includes("wool") ||
      nameLower.includes("sweater") ||
      nameLower.includes("coat") ||
      nameLower.includes("jacket")
    ) {
      return "winter";
    }
    if (
      nameLower.includes("linen") ||
      nameLower.includes("cotton") ||
      nameLower.includes("light")
    ) {
      return "summer";
    }
    return "all-season";
  };

  // Infer material from name
  const inferMaterial = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("wool")) return "wool";
    if (nameLower.includes("cotton")) return "cotton";
    if (nameLower.includes("linen")) return "linen";
    if (nameLower.includes("cashmere")) return "cashmere";
    if (nameLower.includes("denim")) return "denim";
    if (nameLower.includes("leather")) return "leather";
    if (nameLower.includes("silk")) return "silk";
    return "cotton";
  };

  // Build comprehensive tags from traits and attributes
  const buildTags = (name: string, traits?: ClosetItem["traits"]): string[] => {
    const tags: string[] = [];

    // Add style traits
    if (traits?.style) {
      tags.push(...traits.style);
    }

    // Add fit trait
    if (traits?.fit) {
      tags.push(traits.fit);
    }

    // Add occasion traits
    if (traits?.occasion) {
      tags.push(...traits.occasion);
    }

    // Add vibrancy trait
    if (traits?.vibrancy) {
      tags.push(traits.vibrancy);
    }

    // Add versatility trait
    if (traits?.versatility) {
      tags.push(`versatile-${traits.versatility}`);
    }

    // Add material inferred from name
    const material = inferMaterial(name);
    tags.push(material);

    // Add category
    tags.push(item.category);

    return tags;
  };

  return {
    id: item.id,
    userId,
    name: item.name,
    category: categoryMap[item.category],
    primaryColor: item.color.toLowerCase(),
    material: inferMaterial(item.name),
    season: inferSeason(item.name, item.category),
    imageUrl: item.src,
    tags: buildTags(item.name, item.traits),
    createdAt: new Date(),
  };
}

/**
 * Convert multiple closet items to Garments
 */
export function closetItemsToGarments(
  items: ClosetItem[],
  userId: string
): Garment[] {
  return items.map((item) => closetItemToGarment(item, userId));
}
