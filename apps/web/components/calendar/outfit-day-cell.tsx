"use client";

import Image from "next/image";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";

type GarmentPreview = {
  imageUrl?: string;
  name?: string;
};

export function OutfitDayCell({
  day,
  dateStr,
  garmentPreviews,
  onSelect,
  isMuted,
}: {
  day: Date;
  dateStr: string;
  garmentPreviews: GarmentPreview[];
  onSelect: () => void;
  /** Past days: still clickable for history; styled muted */
  isMuted: boolean;
}) {
  const hasPlan = garmentPreviews.length > 0;
  const label = hasPlan
    ? `Outfit planned for ${dateStr}. Open for details.`
    : isMuted
      ? `View ${dateStr}`
      : `Assign outfit for ${dateStr}`;

  return (
    <div
      className={cn(
        "min-h-[96px] sm:min-h-[88px] bg-background p-2 border-t border-border transition-colors",
        isMuted && "bg-muted/20"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full min-h-[72px] h-full text-left flex flex-col gap-1 rounded-sm p-0.5 -m-0.5",
          "hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange cursor-pointer transition-colors duration-200"
        )}
        aria-label={label}
      >
        <span
          className={cn(
            "text-[12px] font-medium tabular-nums",
            isToday(day) &&
              "text-signal-orange ring-1 ring-signal-orange/40 rounded px-1 -ml-0.5 w-fit",
            !isToday(day) && "text-foreground"
          )}
        >
          {format(day, "d")}
        </span>
        {hasPlan ? (
          <div className="flex gap-1 mt-0.5 flex-wrap">
            {garmentPreviews.slice(0, 2).map((g, j) =>
              g.imageUrl ? (
                <div
                  key={j}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-sm overflow-hidden border border-border shrink-0"
                >
                  <Image
                    src={g.imageUrl}
                    alt={g.name ? `${g.name} thumbnail` : "Garment thumbnail"}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div
                  key={j}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm border border-border bg-secondary flex items-center justify-center"
                  title={g.name}
                >
                  <span className="text-[9px] text-muted-foreground">—</span>
                </div>
              )
            )}
          </div>
        ) : null}
      </button>
    </div>
  );
}
