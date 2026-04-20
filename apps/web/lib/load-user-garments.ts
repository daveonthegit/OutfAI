import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { convexGarmentDocToGarment } from "@/lib/convex-garment";
import type { Garment } from "@shared/types";
import { NextResponse } from "next/server";

/**
 * Loads the signed-in user's garments from Convex.
 * If `garmentIds` is set, returns only those IDs (must exist on the user); otherwise the full closet.
 */
export async function loadGarmentsForAuthenticatedUser(
  garmentIds: string[] | undefined
): Promise<
  { ok: true; garments: Garment[] } | { ok: false; response: NextResponse }
> {
  const docs = await fetchAuthQuery(api.garments.list, {});
  if (!Array.isArray(docs)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const mapped = docs.map(convexGarmentDocToGarment);

  if (garmentIds == null || garmentIds.length === 0) {
    return { ok: true, garments: mapped };
  }

  const byId = new Map(mapped.map((g) => [g.id, g]));
  const out: Garment[] = [];
  for (const id of garmentIds) {
    const g = byId.get(id);
    if (!g) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "One or more garment ids are not in your closet" },
          { status: 403 }
        ),
      };
    }
    out.push(g);
  }
  return { ok: true, garments: out };
}
