import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const ALLOWED_PREFIXES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Validates a just-uploaded Convex storage file is a reasonable image.
 * Call from mutations after the client uploads to a generated URL.
 */
export async function assertStorageIsImage(
  ctx: MutationCtx,
  storageId: Id<"_storage">
): Promise<void> {
  const meta = await ctx.storage.getMetadata(storageId);
  if (!meta) {
    throw new Error("Upload not found or expired");
  }
  if (meta.size > MAX_IMAGE_BYTES) {
    await ctx.storage.delete(storageId);
    throw new Error("Image file is too large");
  }
  const ct = meta.contentType?.toLowerCase() ?? "";
  const ok = ALLOWED_PREFIXES.some((p) => ct.startsWith(p));
  if (!ok) {
    await ctx.storage.delete(storageId);
    throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  }
}
