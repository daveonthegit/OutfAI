"use client";

import Image from "next/image";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { BrutalistButton } from "@/components/brutalist-button";
import { cn } from "@/lib/utils";

export function AddFromClosetPanel({
  closetSearch,
  onClosetSearchChange,
  closetCategory,
  onClosetCategoryChange,
  closetSort,
  onClosetSortChange,
  closetCategories,
  filteredCloset,
  unpackedCount,
  selectedIds,
  onToggleGarment,
  onAddSelected,
  onSelectAllShown,
  onClearSelection,
  onCancel,
}: {
  closetSearch: string;
  onClosetSearchChange: (v: string) => void;
  closetCategory: string;
  onClosetCategoryChange: (v: string) => void;
  closetSort: "category" | "name";
  onClosetSortChange: (v: "category" | "name") => void;
  closetCategories: string[];
  filteredCloset: Doc<"garments">[];
  unpackedCount: number;
  selectedIds: Set<Id<"garments">>;
  onToggleGarment: (id: Id<"garments">) => void;
  onAddSelected: () => void;
  onSelectAllShown: () => void;
  onClearSelection: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 min-h-0 flex-1">
      <div className="flex flex-col gap-3 shrink-0">
        <input
          type="search"
          placeholder="Search by name or category…"
          value={closetSearch}
          onChange={(e) => onClosetSearchChange(e.target.value)}
          className="w-full rounded border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.12em] placeholder:text-muted-foreground outline-none focus:border-signal-orange/60"
          aria-label="Search closet"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onClosetCategoryChange("all")}
            className={cn(
              "px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors duration-200 cursor-pointer",
              closetCategory === "all"
                ? "border-signal-orange text-signal-orange bg-signal-orange/10"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {closetCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onClosetCategoryChange(cat)}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors duration-200 cursor-pointer",
                closetCategory === cat
                  ? "border-signal-orange text-signal-orange bg-signal-orange/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Sort:
          </span>
          <select
            value={closetSort}
            onChange={(e) =>
              onClosetSortChange(e.target.value as "category" | "name")
            }
            className="rounded border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider outline-none focus:border-signal-orange/60 cursor-pointer"
            aria-label="Sort by"
          >
            <option value="category">Category</option>
            <option value="name">Name</option>
          </select>
          {filteredCloset.length < unpackedCount && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {filteredCloset.length} of {unpackedCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pb-2">
        {filteredCloset.map((g) => {
          const isSelected = selectedIds.has(g._id);
          return (
            <button
              key={g._id}
              type="button"
              onClick={() => onToggleGarment(g._id)}
              className={cn(
                "border p-2 text-left transition-colors duration-200 cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange",
                isSelected
                  ? "border-signal-orange bg-signal-orange/10"
                  : "border-border hover:border-signal-orange"
              )}
            >
              <div className="aspect-square relative mb-1">
                {g.imageUrl ? (
                  <Image
                    src={g.imageUrl}
                    alt={g.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-secondary flex items-center justify-center text-[9px]">
                    {g.category}
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase truncate block">
                {g.name}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase">
                {g.category}
              </span>
            </button>
          );
        })}
      </div>

      {unpackedCount === 0 && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground py-4">
          All closet items are already in this trip.
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border shrink-0">
        <BrutalistButton
          onClick={onAddSelected}
          disabled={selectedIds.size === 0}
          className="cursor-pointer"
        >
          Add {selectedIds.size} to trip
        </BrutalistButton>
        <button
          type="button"
          onClick={onSelectAllShown}
          className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border hover:border-signal-orange text-foreground cursor-pointer transition-colors duration-200"
        >
          Select all shown
        </button>
        <button
          type="button"
          onClick={onClearSelection}
          className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
        >
          Clear selection
        </button>
        <BrutalistButton
          variant="ghost"
          onClick={onCancel}
          className="cursor-pointer"
        >
          Cancel
        </BrutalistButton>
      </div>
    </div>
  );
}
