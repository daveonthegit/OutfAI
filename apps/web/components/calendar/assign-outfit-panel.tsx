"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import type { Id } from "@convex/_generated/dataModel";
import { BrutalistButton } from "@/components/brutalist-button";
import { ResponsivePlanModal } from "@/components/plan-hub/responsive-plan-modal";
import { cn } from "@/lib/utils";

export type OutfitItem = {
  _id: Id<"outfits">;
  contextMood?: string;
  savedAt: number;
  garments: Array<{
    _id: Id<"garments">;
    name?: string;
    category?: string;
    imageUrl?: string;
  }>;
};

export type CalendarPlanGarment = {
  _id: Id<"garments">;
  name?: string;
  category?: string;
  imageUrl?: string;
};

export type CalendarPlanPreview = {
  garments: CalendarPlanGarment[];
  contextMood?: string;
} | null;

function matchOutfit(
  outfit: OutfitItem,
  query: string,
  moodFilter: string | null
): boolean {
  const q = query.trim().toLowerCase();
  if (q) {
    const moodMatch = outfit.contextMood?.toLowerCase().includes(q);
    const nameMatch = outfit.garments.some((g) =>
      (g.name ?? "").toLowerCase().includes(q)
    );
    const categoryMatch = outfit.garments.some((g) =>
      (g.category ?? "").toLowerCase().includes(q)
    );
    if (!moodMatch && !nameMatch && !categoryMatch) return false;
  }
  if (moodFilter && moodFilter !== "all") {
    if ((outfit.contextMood ?? "").toLowerCase() !== moodFilter.toLowerCase())
      return false;
  }
  return true;
}

function AssignOutfitForm({
  outfitList,
  onAssign,
}: {
  outfitList: OutfitItem[];
  onAssign: (outfitId: Id<"outfits">) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  const moods = useMemo(() => {
    const set = new Set<string>();
    outfitList.forEach((o) => {
      if (o.contextMood) set.add(o.contextMood.toLowerCase());
    });
    return Array.from(set).sort();
  }, [outfitList]);

  const filteredOutfits = useMemo(
    () => outfitList.filter((o) => matchOutfit(o, searchQuery, moodFilter)),
    [outfitList, searchQuery, moodFilter]
  );

  if (outfitList.length === 0) {
    return (
      <div className="space-y-4 py-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          No saved outfits yet. Save one from Today or Archive first.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.2em] text-signal-orange hover:underline cursor-pointer transition-colors"
          >
            Go to Today
          </Link>
          <Link
            href="/archive"
            className="text-[11px] uppercase tracking-[0.2em] text-signal-orange hover:underline cursor-pointer transition-colors"
          >
            Open Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 shrink-0">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by mood, garment name, or category…"
          className="w-full border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
          aria-label="Search outfits"
        />
        {moods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMoodFilter(null)}
              className={cn(
                "px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors cursor-pointer duration-200",
                moodFilter === null
                  ? "border-signal-orange bg-signal-orange/20 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground"
              )}
            >
              All
            </button>
            {moods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMoodFilter(moodFilter === m ? null : m)}
                className={cn(
                  "px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors cursor-pointer duration-200",
                  moodFilter === m
                    ? "border-signal-orange bg-signal-orange/20 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto min-h-[40vh] md:min-h-[360px]">
        {filteredOutfits.length === 0 ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground py-4">
            No outfits match. Try a different search or mood.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
            {filteredOutfits.map((outfit) => {
              const garments = outfit.garments ?? [];
              return (
                <button
                  key={outfit._id}
                  type="button"
                  onClick={() => onAssign(outfit._id)}
                  className="flex flex-col border border-border bg-card hover:border-signal-orange hover:bg-secondary/50 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange rounded-sm overflow-hidden cursor-pointer"
                >
                  <div className="aspect-square grid grid-cols-2 grid-rows-2 gap-px bg-border">
                    {garments.slice(0, 4).map((g) =>
                      g.imageUrl ? (
                        <div
                          key={g._id}
                          className="relative w-full h-full min-h-0 bg-background"
                        >
                          <Image
                            src={g.imageUrl}
                            alt={g.name ?? "Outfit piece"}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        </div>
                      ) : (
                        <div
                          key={g._id}
                          className="bg-secondary flex items-center justify-center text-[10px] uppercase text-muted-foreground min-h-0"
                        >
                          {(g.category ?? "").slice(0, 1)}
                        </div>
                      )
                    )}
                  </div>
                  <div className="p-2 flex flex-col gap-0.5">
                    {outfit.contextMood && (
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {outfit.contextMood}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-widest">
                      {garments.length} piece{garments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function ReadOnlyPlanSummary({ plan }: { plan: CalendarPlanPreview }) {
  if (!plan?.garments?.length) {
    return (
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground py-4">
        No outfit was planned for this day.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {plan.contextMood && (
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Mood: {plan.contextMood}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {plan.garments.map((g) => (
          <div
            key={g._id}
            className="border border-border bg-card rounded-sm overflow-hidden"
          >
            <div className="aspect-square relative bg-secondary">
              {g.imageUrl ? (
                <Image
                  src={g.imageUrl}
                  alt={g.name ?? "Garment"}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase text-muted-foreground">
                  {g.category ?? "—"}
                </div>
              )}
            </div>
            <p className="p-2 text-[10px] uppercase truncate">{g.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarOutfitPanel({
  open,
  onOpenChange,
  dateStr,
  isReadOnly,
  planPreview,
  outfitList,
  onAssign,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateStr: string | null;
  isReadOnly: boolean;
  planPreview: CalendarPlanPreview;
  outfitList: OutfitItem[];
  onAssign: (outfitId: Id<"outfits">) => void;
  onClear: () => void;
}) {
  const titleDate =
    dateStr && format(new Date(dateStr + "T12:00:00"), "EEEE, MMM d");

  const title = isReadOnly
    ? `Outfit on ${titleDate ?? ""}`
    : `Assign outfit — ${titleDate ?? ""}`;

  const description = isReadOnly
    ? "This date is in the past. You can review what was planned or clear it from the calendar."
    : "Choose a saved outfit for this day. You can change it anytime before the day arrives.";

  const footerActions = (
    <div className="flex flex-wrap gap-3 w-full sm:justify-end">
      {planPreview?.garments?.length ? (
        <BrutalistButton variant="outline" onClick={onClear} type="button">
          Clear day
        </BrutalistButton>
      ) : null}
      <BrutalistButton
        variant="ghost"
        onClick={() => onOpenChange(false)}
        type="button"
      >
        {isReadOnly ? "Close" : "Cancel"}
      </BrutalistButton>
    </div>
  );

  const inner = (
    <>
      {isReadOnly ? (
        <ReadOnlyPlanSummary plan={planPreview} />
      ) : (
        <AssignOutfitForm outfitList={outfitList} onAssign={onAssign} />
      )}
    </>
  );

  return (
    <ResponsivePlanModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footerActions}
    >
      {inner}
    </ResponsivePlanModal>
  );
}
