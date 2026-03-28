import { api } from "@convex/_generated/api";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";

export async function requireConvexUser(): Promise<
  { _id: string } | NextResponse
> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await fetchAuthQuery(api.auth.getCurrentUser, {});
  if (!user || typeof user._id !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export function rateLimitKey(request: NextRequest, route: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${route}`;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Returns true if allowed, false if over limit. */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

export function rejectIfBodyTooLarge(
  request: NextRequest,
  maxBytes: number
): NextResponse | null {
  const raw = request.headers.get("content-length");
  if (raw == null) return null;
  const n = parseInt(raw, 10);
  if (Number.isFinite(n) && n > maxBytes) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }
  return null;
}

/** Ensures wardrobe payloads cannot reference another user's garments. */
export function assertGarmentsBelongToUser(
  garments: Array<{ userId?: string }>,
  userId: string
): boolean {
  return garments.every((g) => String(g.userId ?? "") === userId);
}
