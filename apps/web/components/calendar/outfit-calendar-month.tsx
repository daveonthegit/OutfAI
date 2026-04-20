"use client";

import { addMonths, format, isSameMonth, subMonths } from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { OutfitDayCell } from "@/components/calendar/outfit-day-cell";
import { isPastCalendarDay } from "@/components/calendar/outfit-calendar-utils";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type PlanGarment = { imageUrl?: string; name?: string };

export function OutfitCalendarMonth({
  viewMonth,
  onViewMonthChange,
  days,
  getGarmentPreviewsForDate,
  onDaySelect,
  plannedCount,
  isLoading,
}: {
  viewMonth: Date;
  onViewMonthChange: (d: Date) => void;
  days: (Date | null)[];
  getGarmentPreviewsForDate: (dateStr: string) => PlanGarment[];
  onDaySelect: (dateStr: string, day: Date) => void;
  plannedCount: number;
  isLoading: boolean;
}) {
  const now = new Date();
  const isCurrentMonthView = isSameMonth(viewMonth, now);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onViewMonthChange(subMonths(viewMonth, 1))}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays
              className="size-4 text-muted-foreground shrink-0 hidden sm:block"
              aria-hidden
            />
            <h2 className="text-sm uppercase tracking-[0.2em] font-medium truncate">
              {format(viewMonth, "MMMM yyyy")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {!isCurrentMonthView && (
            <button
              type="button"
              onClick={() =>
                onViewMonthChange(
                  new Date(now.getFullYear(), now.getMonth(), 1)
                )
              }
              className="text-[10px] uppercase tracking-[0.2em] border border-border px-3 py-1.5 hover:border-signal-orange hover:text-signal-orange transition-colors duration-200 cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
            >
              Today
            </button>
          )}
          <p
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {isLoading ? "…" : `${plannedCount} planned`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-px border border-border bg-border rounded-sm overflow-hidden">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-background p-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-background p-2 min-h-[96px]">
              <Skeleton className="h-4 w-6 mb-2" />
              <Skeleton className="h-7 w-14" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-px border border-border bg-border rounded-sm overflow-hidden motion-reduce:transition-none">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-background p-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {days.map((d, i) => {
            if (!d) {
              return (
                <div key={`pad-${i}`} className="bg-muted/30 min-h-[96px]" />
              );
            }
            const dateStr = format(d, "yyyy-MM-dd");
            const previews = getGarmentPreviewsForDate(dateStr);
            const inMonth = isSameMonth(d, viewMonth);
            const muted = isPastCalendarDay(d, now) || !inMonth;

            return (
              <OutfitDayCell
                key={dateStr}
                day={d}
                dateStr={dateStr}
                garmentPreviews={previews}
                isMuted={muted}
                onSelect={() => onDaySelect(dateStr, d)}
              />
            );
          })}
        </div>
      )}

      <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground max-w-prose motion-reduce:transition-none">
        Tap a day to plan or review. Future days let you assign or change an
        outfit; past days show history. Save outfits from{" "}
        <LinkInline href="/">Today</LinkInline> or{" "}
        <LinkInline href="/archive">Archive</LinkInline> first.
      </p>
    </div>
  );
}

function LinkInline({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-signal-orange hover:underline underline-offset-2 cursor-pointer transition-colors duration-200"
    >
      {children}
    </Link>
  );
}
