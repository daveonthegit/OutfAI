import {
  internalAction,
  internalMutation,
  mutation,
  type MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { internal, components } from "./_generated/api";
import { getAuthUser } from "./auth";
import { MOCK_CLOSET_ITEMS } from "../shared/data/mock-closet";

/**
 * Seeds the current user's closet with mock garments if it is empty.
 * Safe to call multiple times — it is a no-op when garments already exist.
 * Called automatically from the home page on first load after sign-in.
 */
export const seedDevCloset = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return seedGarmentsForUser(ctx, user._id);
  },
});

/**
 * Seeds garments for a specific user ID.
 * Called by seedDevCloset (client-triggered) and createTestAccount (server-triggered).
 * No-op when the user already has garments.
 */
export const seedClosetForUserId = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return seedGarmentsForUser(ctx, userId);
  },
});

/** Shared insertion logic used by both seedDevCloset and seedClosetForUserId. */
async function seedGarmentsForUser(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db
    .query("garments")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (existing !== null) return { seeded: false, count: 0 };

  for (const item of MOCK_CLOSET_ITEMS) {
    await ctx.db.insert("garments", {
      userId,
      name: item.name,
      category: item.category,
      primaryColor: item.primaryColor,
      tags: item.tags,
      style: item.style,
      fit: item.fit,
      occasion: item.occasion,
      versatility: item.versatility,
      vibrancy: item.vibrancy,
      imageUrl: item.imageUrl,
    });
  }

  return { seeded: true, count: MOCK_CLOSET_ITEMS.length };
}

/**
 * Creates the testaccount / Testaccount123. test account and seeds its closet.
 *
 * Run once from the Convex dashboard:
 *   Functions → seed → createTestAccount → Run
 *
 * Why internalAction (not mutation):
 *   BetterAuth's signUpEmail uses argon2 for password hashing, which is a
 *   native Node.js module. Convex mutations run in a V8 isolate (no Node.js),
 *   so hashing would fail. Actions run in the full Node.js runtime.
 *   We call BetterAuth's HTTP endpoint directly so it runs in its own context.
 *
 * Idempotent — safe to run multiple times.
 */
export const createTestAccount = internalAction({
  args: {},
  handler: async (ctx) => {
    const siteUrl = process.env.SITE_URL;
    if (!siteUrl)
      throw new Error("SITE_URL environment variable is not set in Convex");

    // ── 1. Create the account via BetterAuth's HTTP sign-up endpoint ──────────
    const res = await fetch(`${siteUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testaccount@outfai.local",
        password: "Testaccount123.",
        name: "testaccount",
        username: "testaccount",
      }),
    });

    let alreadyExists = false;

    if (!res.ok) {
      const body = await res.text();
      if (/exist|duplicate|taken|already/i.test(body)) {
        alreadyExists = true;
      } else {
        throw new Error(`Sign-up failed (${res.status}): ${body}`);
      }
    }

    // ── 2. Find the user's _id in BetterAuth's component table ────────────────
    const userDoc = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: "testaccount@outfai.local" }],
    });

    if (!userDoc) {
      throw new Error(
        "Account was created but user document could not be found"
      );
    }

    // ── 3. Seed the closet so the test account is fully ready immediately ──────
    const seedResult = await ctx.runMutation(
      internal.seed.seedClosetForUserId,
      {
        userId: userDoc._id as string,
      }
    );

    return {
      created: !alreadyExists,
      userId: userDoc._id,
      closet: seedResult,
    };
  },
});
