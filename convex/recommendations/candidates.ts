import type { Doc, Id } from "../_generated/dataModel";
import type { RecommendationContext } from "../personalization/scoring";

const MAX_CANDIDATES = 30;
const MAX_PER_SLOT = 6;

export type CandidateOutfit = {
  garmentIds: Id<"garments">[];
  garments: Doc<"garments">[];
};

/**
 * Build up to ~30 valid outfits (top + bottom + shoes) from the wardrobe.
 * Context may trim obviously mismatched pieces later in scoring.
 */
export function generateCandidates(
  allGarments: Doc<"garments">[],
  _context: RecommendationContext
): CandidateOutfit[] {
  void _context;
  const tops = allGarments.filter((g) => g.category === "top");
  const bottoms = allGarments.filter((g) => g.category === "bottom");
  const shoes = allGarments.filter((g) => g.category === "shoes");

  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    return [];
  }

  const tSlice = tops.slice(0, MAX_PER_SLOT);
  const bSlice = bottoms.slice(0, MAX_PER_SLOT);
  const sSlice = shoes.slice(0, MAX_PER_SLOT);

  const raw: CandidateOutfit[] = [];
  for (const t of tSlice) {
    for (const b of bSlice) {
      for (const s of sSlice) {
        raw.push({
          garmentIds: [t._id, b._id, s._id],
          garments: [t, b, s],
        });
        if (raw.length >= 80) break;
      }
      if (raw.length >= 80) break;
    }
    if (raw.length >= 80) break;
  }

  shuffleInPlace(raw);
  return raw.slice(0, MAX_CANDIDATES);
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
