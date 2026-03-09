/**
 * Optional commerce interaction logs (click-through, dismissed).
 * Use only with user consent; do not track without consent.
 * Follow existing analytics/privacy patterns in the repo.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";

export const log = mutation({
  args: {
    productId: v.id("external_products"),
    action: v.string(), // "clicked" | "dismissed"
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    if (args.action !== "clicked" && args.action !== "dismissed") {
      throw new Error("Invalid action");
    }
    return ctx.db.insert("commerceInteractionLogs", {
      userId: user._id,
      productId: args.productId,
      action: args.action,
      loggedAt: Date.now(),
    });
  },
});
