import { api } from "@convex/_generated/api";
import { requireConvexUser } from "@/lib/api-route-helpers";
import { fetchAuthMutation } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

export type AccountDeleteResult =
  | { ok: true; deleted: true }
  | {
      ok: false;
      step: "auth" | "data" | "config";
      message: string;
      /** App data was already removed; only login removal failed — safe to retry. */
      partial?: boolean;
    };

/**
 * Account deletion: wipe Convex app data while the session is valid, then remove Better Auth.
 * If login removal fails, purge is already done (idempotent); user can retry to finish auth removal.
 */
export async function POST(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        step: "config",
        message: "Invalid request body",
      } satisfies AccountDeleteResult,
      { status: 400 }
    );
  }

  if (typeof password !== "string" || !password.trim()) {
    return NextResponse.json(
      {
        ok: false,
        step: "config",
        message: "Password is required",
      } satisfies AccountDeleteResult,
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const cookie = request.headers.get("cookie") ?? "";

  try {
    await fetchAuthMutation(api.account.deleteAllUserData, {});
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not remove app data.";
    return NextResponse.json(
      { ok: false, step: "data", message } satisfies AccountDeleteResult,
      { status: 502 }
    );
  }

  const authRes = await fetch(`${origin}/api/auth/delete-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      Origin: origin,
      Referer: `${origin}/profile/settings`,
    },
    body: JSON.stringify({ password }),
  });

  if (!authRes.ok) {
    const errBody = (await authRes.json().catch(() => null)) as {
      message?: string;
    } | null;
    const message =
      errBody && typeof errBody.message === "string"
        ? errBody.message
        : "Could not remove your login. Your app data was already cleared — try again.";
    return NextResponse.json(
      {
        ok: false,
        step: "auth",
        message,
        partial: true,
      } satisfies AccountDeleteResult,
      { status: authRes.status }
    );
  }

  return NextResponse.json({
    ok: true,
    deleted: true,
  } satisfies AccountDeleteResult);
}
