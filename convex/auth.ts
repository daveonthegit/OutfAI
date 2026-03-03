import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireRunMutationCtx } from "@convex-dev/better-auth/utils";
import { username } from "better-auth/plugins";
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

// Sender address: use a verified domain in production or Resend's onboarding domain
const FROM_EMAIL = process.env.EMAIL_FROM ?? "OutfAI <onboarding@resend.dev>";

export const authComponent = createClient<DataModel>(components.betterAuth);
const resend = new Resend(components.resend, {});

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      // Keep minimum length of 1 so the dev test/test account still works
      minPasswordLength: 1,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const runCtx = requireRunMutationCtx(ctx);
        await resend.sendEmail(runCtx, {
          from: FROM_EMAIL,
          to: user.email,
          subject: "Verify your email — OutfAI",
          html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;"><h1 style="font-size:1.25rem;">Verify your email</h1><p>Thanks for signing up for OutfAI. Click the link below to verify your email and start using your wardrobe.</p><p><a href="${url}" style="display:inline-block;background:#000;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;">Verify email</a></p><p>Or copy this link: <br/><a href="${url}">${url}</a></p><p style="color:#666;font-size:0.875rem;">If you didn't create an account, you can ignore this email.</p></body></html>`,
        });
      },
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
