import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

/**
 * Ensures every garment ID exists and belongs to the given user. Call from mutations
 * that accept foreign garment IDs (outfits, packing lists).
 */
export async function assertGarmentsOwnedByUser(
  ctx: MutationCtx,
  userId: string,
  garmentIds: Id<"garments">[]
): Promise<void> {
  for (const id of garmentIds) {
    const garment = await ctx.db.get(id);
    if (!garment || garment.userId !== userId) {
      throw new Error("Invalid or unauthorized garment reference");
    }
  }
}
