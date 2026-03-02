import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";

export const log = mutation({
  args: {
    outfitId: v.optional(v.id("outfits")),
    garmentIds: v.array(v.string()),
    action: v.string(), // "shown" | "saved" | "skipped" | "worn"
    mood: v.optional(v.string()),
    weather: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return ctx.db.insert("recommendationLogs", {
      userId: user._id,
      loggedAt: Date.now(),
      ...args,
    });
  },
});
