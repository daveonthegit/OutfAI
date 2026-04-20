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
