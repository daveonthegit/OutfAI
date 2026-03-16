"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  startOfDay,
} from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { UserAvatar } from "@/components/user-avatar";
import { BrutalistButton } from "@/components/brutalist-button";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  useRequireAuth("/calendar");
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [assignDate, setAssignDate] = useState<string | null>(null);

  const start = startOfMonth(viewMonth);
  const end = endOfMonth(viewMonth);
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const plans = useQuery(api.outfitPlans.listByDateRange, {
    startDate: startStr,
    endDate: endStr,
  });
  const outfits = useQuery(api.outfits.list) ?? [];
  const assignPlan = useMutation(api.outfitPlans.assign);
  const removePlan = useMutation(api.outfitPlans.remove);

  const plansByDate = useMemo(() => {
    const map = new Map<string, NonNullable<typeof plans>[number]>();
    if (plans) for (const p of plans) map.set(p.date, p);
    return map;
  }, [plans]);

  // Calendar grid: pad start so first day aligns with weekday
  const days = useMemo(() => {
    const startPad = start.getDay();
    const monthDays = eachDayOfInterval({ start, end });
    const pad = Array(startPad).fill(null) as (Date | null)[];
    return [...pad, ...monthDays];
  }, [start, end]);

  const handleAssign = async (date: string, outfitId: Id<"outfits">) => {
    try {
      await assignPlan({ date, outfitId });
      setAssignDate(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (date: string) => {
    try {
      await removePlan({ date });
      setAssignDate(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/plan"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            Plan
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/archive"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              Archive
            </Link>
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
              Calendar
            </span>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <SectionHeader
            title="outfit calendar"
            subtitle="Plan what to wear on upcoming days"
          />

          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-[10px] tracking-widest"
              aria-label="Previous month"
            >
              ← Prev
            </button>
            <h2 className="text-sm uppercase tracking-[0.2em] font-medium">
              {format(viewMonth, "MMMM yyyy")}
            </h2>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-[10px] tracking-widest"
              aria-label="Next month"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px border border-border bg-border">
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
                return <div key={`pad-${i}`} className="bg-muted/30 min-h-[80px]" />;
              }
              const dateStr = format(d, "yyyy-MM-dd");
              const plan = plansByDate.get(dateStr);
              const isCurrentMonth = isSameMonth(d, viewMonth);
              const todayStart = startOfDay(new Date());
              const dayStart = startOfDay(d);
              const canAssign =
                isCurrentMonth && dayStart.getTime() >= todayStart.getTime();

              return (
                <div
                  key={dateStr}
                  className={`min-h-[80px] bg-background p-2 border-t border-border ${
                    !isCurrentMonth ? "opacity-40" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => canAssign && setAssignDate(dateStr)}
                    disabled={!canAssign}
                    className={`w-full h-full text-left flex flex-col gap-1 ${
                      canAssign
                        ? "hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
                        : "cursor-default"
                    }`}
                    aria-label={
                      plan
                        ? `Assigned outfit for ${dateStr}. Click to change.`
                        : canAssign
                          ? `Assign outfit for ${dateStr}`
                          : dateStr
                    }
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        isToday(d) ? "text-signal-orange" : "text-foreground"
                      }`}
                    >
                      {format(d, "d")}
                    </span>
                    {plan?.outfit?.garments?.length ? (
                      <div className="flex gap-0.5 mt-1 flex-wrap">
                        {(plan.outfit?.garments ?? [])
                          .slice(0, 2)
                          .map((g, j) => {
                            const row = g as { imageUrl?: string; name: string };
                            return row.imageUrl ? (
                              <div
                                key={j}
                                className="relative w-6 h-6 rounded-sm overflow-hidden border border-border"
                              >
                                <Image
                                  src={row.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                key={j}
                                className="w-6 h-6 rounded-sm border border-border bg-secondary flex items-center justify-center"
                                title={row.name}
                              >
                                <span className="text-[8px]">•</span>
                              </div>
                            );
                          })}
                      </div>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Tap a day to assign or change an outfit. Save outfits from Today or Archive first.
          </p>
        </PageContainer>
      </div>

      {assignDate && (
        <div
          className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-outfit-title"
        >
          <h2 id="assign-outfit-title" className="text-sm uppercase tracking-widest mb-4">
            Outfit for {assignDate}
          </h2>
          <div className="w-full max-w-md max-h-[70vh] overflow-y-auto space-y-2">
            {outfits.length === 0 ? (
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                No saved outfits. Save one from Today or Archive first.
              </p>
            ) : (
              outfits.map((outfit) => {
                const garments = (outfit.garments ?? []).filter(Boolean) as Array<{
                  _id: Id<"garments">;
                  name: string;
                  category: string;
                  imageUrl?: string;
                }>;
                return (
                  <button
                    key={outfit._id}
                    type="button"
                    onClick={() => handleAssign(assignDate, outfit._id)}
                    className="w-full flex items-center gap-3 p-3 border border-border hover:border-signal-orange hover:bg-secondary/50 text-left"
                  >
                    <div className="flex gap-1 shrink-0">
                      {garments.slice(0, 3).map((g) =>
                        g.imageUrl ? (
                          <div
                            key={g._id}
                            className="relative w-10 h-10 rounded border border-border overflow-hidden"
                          >
                            <Image src={g.imageUrl} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <div
                            key={g._id}
                            className="w-10 h-10 rounded border border-border bg-secondary flex items-center justify-center text-[9px]"
                          >
                            {g.category.slice(0, 1)}
                          </div>
                        )
                      )}
                    </div>
                    <span className="text-[11px] uppercase tracking-widest">
                      {garments.length} pieces
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <BrutalistButton
              variant="outline"
              onClick={() => assignDate && handleRemove(assignDate)}
            >
              Clear day
            </BrutalistButton>
            <BrutalistButton variant="ghost" onClick={() => setAssignDate(null)}>
              Cancel
            </BrutalistButton>
          </div>
        </div>
      )}
    </main>
  );
}
