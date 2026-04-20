import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { convexExternalProductDocToExternal } from "@/lib/convex-garment";
import type { ExternalProduct } from "@shared/types";
import { NextResponse } from "next/server";

/**
 * Loads external products from Convex for recommendation (server truth).
 */
export async function loadExternalProductsForAuthenticatedUser(options: {
  limit: number;
  productIds?: string[];
}): Promise<
  | { ok: true; products: ExternalProduct[] }
  | { ok: false; response: NextResponse }
> {
  const docs = await fetchAuthQuery(api.externalProducts.list, {
    limit: options.limit,
  });
  if (!Array.isArray(docs)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const mapped = docs.map(convexExternalProductDocToExternal);

  const ids = options.productIds;
  if (ids == null || ids.length === 0) {
    return { ok: true, products: mapped };
  }

  const byId = new Map(mapped.map((p) => [p.id, p]));
  const out: ExternalProduct[] = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (!p) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "One or more product ids were not found" },
          { status: 403 }
        ),
      };
    }
    out.push(p);
  }
  return { ok: true, products: out };
}
