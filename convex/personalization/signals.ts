import type { Doc } from "../_generated/dataModel";
import { ACTION_DELTAS, type OutfitAction } from "./constants";

export type PreferenceSignal = {
  dim: "color" | "style" | "tag" | "occasion" | "category";
  value: string;
  /** Increment to apply to w[dim][value] after clamping (already ÷ tagsInDim). */
  delta: number;
};

const ACTIONS: OutfitAction[] = ["shown", "saved", "skipped", "worn"];

function isOutfitAction(a: string): a is OutfitAction {
  return (ACTIONS as readonly string[]).includes(a);
}

function countDim(
  garment: Doc<"garments">,
  dim: PreferenceSignal["dim"]
): number {
  switch (dim) {
    case "color":
      return 1;
    case "category":
      return 1;
    case "style":
      return Math.max(1, garment.style?.length ?? 0);
    case "tag":
      return Math.max(1, garment.tags?.length ?? 0);
    case "occasion":
      return Math.max(1, garment.occasion?.length ?? 0);
    default:
      return 1;
  }
}

/**
 * Given one log row and resolved garment docs, emit weighted preference signals.
 * "shown" yields no signals (impressions only).
 */
export function extractSignalsFromLog(
  log: { action: string },
  garmentDocs: Doc<"garments">[]
): PreferenceSignal[] {
  if (!isOutfitAction(log.action) || log.action === "shown") {
    return [];
  }

  const rawDelta = ACTION_DELTAS[log.action];
  const out: PreferenceSignal[] = [];

  for (const g of garmentDocs) {
    const color = g.primaryColor?.trim().toLowerCase();
    if (color) {
      const n = countDim(g, "color");
      out.push({ dim: "color", value: color, delta: rawDelta / n });
    }

    const cat = g.category?.trim().toLowerCase();
    if (cat) {
      const n = countDim(g, "category");
      out.push({ dim: "category", value: cat, delta: rawDelta / n });
    }

    for (const s of g.style ?? []) {
      const v = s.trim().toLowerCase();
      if (!v) continue;
      const n = countDim(g, "style");
      out.push({ dim: "style", value: v, delta: rawDelta / n });
    }

    for (const t of g.tags ?? []) {
      const v = t.trim().toLowerCase();
      if (!v) continue;
      const n = countDim(g, "tag");
      out.push({ dim: "tag", value: v, delta: rawDelta / n });
    }

    for (const o of g.occasion ?? []) {
      const v = o.trim().toLowerCase();
      if (!v) continue;
      const n = countDim(g, "occasion");
      out.push({ dim: "occasion", value: v, delta: rawDelta / n });
    }
  }

  return out;
}
