"use client";

import Image from "next/image";
import type { Doc, Id } from "@convex/_generated/dataModel";

export function PackedGarmentsGrid({
  garments,
  onRemove,
}: {
  garments: Doc<"garments">[];
  onRemove: (id: Id<"garments">) => void;
}) {
  if (garments.length === 0) {
    return (
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground border border-border p-6">
        No pieces yet. Add from your closet to build outfits.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {garments.map((g) => (
        <li key={g._id} className="relative border border-border bg-card group">
          <div className="aspect-square relative">
            {g.imageUrl ? (
              <Image
                src={g.imageUrl}
                alt={g.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-secondary flex items-center justify-center text-[9px] uppercase">
                {g.category}
              </div>
            )}
          </div>
          <p className="p-2 text-[11px] uppercase truncate">{g.name}</p>
          <button
            type="button"
            onClick={() => onRemove(g._id)}
            className="absolute top-1 right-1 p-1 bg-background/90 border border-border text-[9px] uppercase hover:border-destructive hover:text-destructive cursor-pointer transition-colors duration-200"
            aria-label={`Remove ${g.name} from trip`}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
