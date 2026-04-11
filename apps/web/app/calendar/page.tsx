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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type OutfitItem = {
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

export default function CalendarPage() {
  useRequireAuth("/calendar");
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [assignDate, setAssignDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

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

  const outfitList = (outfits ?? []) as OutfitItem[];
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
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
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
          <Breadcrumb className="mb-6">
            <BreadcrumbList className="text-[10px] uppercase tracking-[0.2em]">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/plan">Plan</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Calendar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
                return (
                  <div key={`pad-${i}`} className="bg-muted/30 min-h-[80px]" />
                );
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
                            const row = g as {
                              imageUrl?: string;
                              name: string;
                            };
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
            Tap a day to assign or change an outfit. Save outfits from Today or
            Archive first.
          </p>
        </PageContainer>
      </div>

      {assignDate && (
        <div
          className="fixed inset-0 z-50 bg-background/95 flex flex-col p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-outfit-title"
        >
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full flex-1 min-h-0">
            <h2
              id="assign-outfit-title"
              className="text-sm uppercase tracking-widest shrink-0"
            >
              Assign outfit for {format(new Date(assignDate), "EEEE, MMM d")}
            </h2>

            {outfitList.length === 0 ? (
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                No saved outfits. Save one from Today or Archive first.
              </p>
            ) : (
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
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                          moodFilter === null
                            ? "border-signal-orange bg-signal-orange/20 text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        All
                      </button>
                      {moods.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() =>
                            setMoodFilter(moodFilter === m ? null : m)
                          }
                          className={`px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                            moodFilter === m
                              ? "border-signal-orange bg-signal-orange/20 text-foreground"
                              : "border-border text-muted-foreground hover:border-foreground"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  {filteredOutfits.length === 0 ? (
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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
                            onClick={() => handleAssign(assignDate, outfit._id)}
                            className="flex flex-col border border-border bg-card hover:border-signal-orange hover:bg-secondary/50 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange rounded-sm overflow-hidden"
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
                                      alt=""
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
                                {garments.length} piece
                                {garments.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 shrink-0 pt-2 border-t border-border">
              <BrutalistButton
                variant="outline"
                onClick={() => assignDate && handleRemove(assignDate)}
              >
                Clear day
              </BrutalistButton>
              <BrutalistButton
                variant="ghost"
                onClick={() => {
                  setAssignDate(null);
                  setSearchQuery("");
                  setMoodFilter(null);
                }}
              >
                Cancel
              </BrutalistButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
