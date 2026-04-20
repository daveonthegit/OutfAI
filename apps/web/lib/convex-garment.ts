import type { Doc } from "@convex/_generated/dataModel";
import type { ExternalProduct, Garment, Season } from "@shared/types";

export function convexGarmentDocToGarment(doc: Doc<"garments">): Garment {
  return {
    id: doc._id,
    userId: doc.userId,
    name: doc.name,
    category: doc.category as Garment["category"],
    primaryColor: doc.primaryColor,
    secondaryColor: undefined,
    material: doc.material,
    season: doc.season != null ? (doc.season as Season) : undefined,
    imageUrl: doc.imageUrl,
    imageOriginalUrl: undefined,
    tags: doc.tags,
    style: doc.style,
    fit: doc.fit,
    occasion: doc.occasion,
    versatility: doc.versatility as Garment["versatility"] | undefined,
    vibrancy: doc.vibrancy as Garment["vibrancy"] | undefined,
    createdAt: new Date(doc._creationTime),
  };
}

export function convexExternalProductDocToExternal(
  doc: Doc<"external_products">
): ExternalProduct {
  return {
    id: doc._id,
    source: doc.source,
    sourceProductId: doc.sourceProductId,
    name: doc.name,
    brand: doc.brand,
    category: doc.category,
    subcategory: doc.subcategory,
    color: doc.color,
    styleTags: doc.styleTags,
    occasionTags: doc.occasionTags,
    price: doc.price,
    currency: doc.currency,
    imageUrl: doc.imageUrl,
    productUrl: doc.productUrl,
    affiliateUrl: doc.affiliateUrl,
    availability: doc.availability,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
