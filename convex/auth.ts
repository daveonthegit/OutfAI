import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { username } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      // Keep minimum length of 1 so the dev test/test account still works
      minPasswordLength: 1,
    },
    plugins: [convex({ authConfig }), username()],
  });

/**
 * Safe wrapper around authComponent.getAuthUser.
 *
 * getAuthUser throws ConvexError("Unauthenticated") when no session exists
 * instead of returning null, so every caller would need its own try/catch.
 * This helper normalises that to a null return, matching the expected contract:
 *   undefined = query still loading  (useQuery hasn't resolved yet)
 *   null      = no authenticated user
 *   object    = the BetterAuth user document from the component's `user` table
 *
 * IMPORTANT — user identity:
 *   The returned document's `_id` is the stable user identifier stored in
 *   garments.userId, outfits.userId, etc.
 *   Do NOT use `user.userId` — that is an unrelated optional field added by
 *   the convex plugin that is never populated for email/password accounts.
 */
export async function getAuthUser(ctx: GenericCtx<DataModel>) {
  try {
    return await authComponent.getAuthUser(ctx);
  } catch {
    return null;
  }
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return getAuthUser(ctx);
  },
});
