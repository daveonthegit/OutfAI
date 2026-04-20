"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import {
  CalendarOutfitPanel,
  type CalendarPlanPreview,
  type OutfitItem,
} from "@/components/calendar/assign-outfit-panel";
import { OutfitCalendarMonth } from "@/components/calendar/outfit-calendar-month";
import { isPastCalendarDay } from "@/components/calendar/outfit-calendar-utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

export default function PlanCalendarPage() {
  useRequireAuth("/plan/calendar");
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReadOnly, setSelectedReadOnly] = useState(false);

  const start = startOfMonth(viewMonth);
  const end = endOfMonth(viewMonth);
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const plans = useQuery(api.outfitPlans.listByDateRange, {
    startDate: startStr,
    endDate: endStr,
  });
  const outfits = useQuery(api.outfits.list);
  const assignPlan = useMutation(api.outfitPlans.assign);
  const removePlan = useMutation(api.outfitPlans.remove);

  const isLoading = plans === undefined || outfits === undefined;

  const plansByDate = useMemo(() => {
    const map = new Map<string, NonNullable<typeof plans>[number]>();
    if (plans) for (const p of plans) map.set(p.date, p);
    return map;
  }, [plans]);

  const outfitList = (outfits ?? []) as OutfitItem[];

  const days = useMemo(() => {
    const startPad = start.getDay();
    const monthDays = eachDayOfInterval({ start, end });
    const pad = Array(startPad).fill(null) as (Date | null)[];
    return [...pad, ...monthDays];
  }, [start, end]);

  const plannedCount = useMemo(() => {
    if (!plans) return 0;
    return plans.filter(
      (p) =>
        p.date >= startStr &&
        p.date <= endStr &&
        (p.outfit?.garments?.length ?? 0) > 0
    ).length;
  }, [plans, startStr, endStr]);

  const getGarmentPreviewsForDate = useCallback(
    (dateStr: string) => {
      const plan = plansByDate.get(dateStr);
      const garments = plan?.outfit?.garments?.filter(Boolean) ?? [];
      if (!garments.length) return [];
      return garments.slice(0, 2).map((g) => {
        if (!g) return { imageUrl: undefined, name: undefined };
        return { imageUrl: g.imageUrl, name: g.name };
      });
    },
    [plansByDate]
  );

  const planPreviewForSelected = useMemo((): CalendarPlanPreview => {
    if (!selectedDate) return null;
    const plan = plansByDate.get(selectedDate);
    const og = plan?.outfit;
    if (!og?.garments?.length) return null;
    return {
      contextMood: og.contextMood,
      garments: og.garments
        .filter((g): g is NonNullable<typeof g> => g != null)
        .map((g) => ({
          _id: g._id,
          name: g.name,
          category: g.category,
          imageUrl: g.imageUrl,
        })),
    };
  }, [selectedDate, plansByDate]);

  const handleOpenDay = useCallback((dateStr: string, day: Date) => {
    setSelectedDate(dateStr);
    setSelectedReadOnly(isPastCalendarDay(day));
  }, []);

  const handleAssign = async (outfitId: Id<"outfits">) => {
    if (!selectedDate || selectedReadOnly) return;
    try {
      await assignPlan({ date: selectedDate, outfitId });
      toast.success("Outfit saved for that day");
      setSelectedDate(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not assign outfit");
    }
  };

  const handleRemove = async () => {
    if (!selectedDate) return;
    try {
      await removePlan({ date: selectedDate });
      toast.success("Day cleared");
      setSelectedDate(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not clear day");
    }
  };

  const panelOpen = selectedDate !== null;

  return (
    <>
      <PageContainer>
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="text-[10px] uppercase tracking-[0.2em]">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/plan">Hub</Link>
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
          subtitle="Plan what to wear on upcoming days. Packing trips can assign looks here too."
        />

        <OutfitCalendarMonth
          viewMonth={viewMonth}
          onViewMonthChange={setViewMonth}
          days={days}
          getGarmentPreviewsForDate={getGarmentPreviewsForDate}
          onDaySelect={handleOpenDay}
          plannedCount={plannedCount}
          isLoading={isLoading}
        />
      </PageContainer>

      <CalendarOutfitPanel
        open={panelOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
        dateStr={selectedDate}
        isReadOnly={selectedReadOnly}
        planPreview={planPreviewForSelected}
        outfitList={outfitList}
        onAssign={handleAssign}
        onClear={handleRemove}
      />
    </>
  );
}
