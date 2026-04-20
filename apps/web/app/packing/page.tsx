"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { UserAvatar } from "@/components/user-avatar";
import { BrutalistButton } from "@/components/brutalist-button";
import { NewTripForm } from "@/components/packing/new-trip-form";
import { ResponsivePlanModal } from "@/components/plan-hub/responsive-plan-modal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function PackingPage() {
  useRequireAuth("/packing");
  const router = useRouter();
  const lists = useQuery(api.packingLists.list);
  const createList = useMutation(api.packingLists.create);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [newTripFormKey, setNewTripFormKey] = useState(0);
  const [creating, setCreating] = useState(false);

  const handleCreate = async ({
    name,
    dateRange,
  }: {
    name: string;
    dateRange: DateRange | undefined;
  }) => {
    const from = dateRange?.from;
    const to = dateRange?.to ?? from;
    const start = from ? from.getTime() : Date.now();
    const end = to ? to.getTime() : start;
    if (end < start) {
      toast.error("End date must be on or after start date.");
      return;
    }
    setCreating(true);
    try {
      const id = await createList({
        name: name.trim() || "My trip",
        startDate: start,
        endDate: end,
      });
      setSheetOpen(false);
      router.push(`/packing/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setCreating(false);
    }
  };

  const isLoading = lists === undefined;
  const tripList = lists ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/plan"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100 cursor-pointer"
          >
            Plan
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
              Packing
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
                <BreadcrumbPage>Packing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <SectionHeader
            title="packing planner"
            subtitle="Capsule wardrobes for your trips"
          />

          <div className="mb-6">
            <BrutalistButton
              type="button"
              onClick={() => setSheetOpen(true)}
              className="cursor-pointer"
            >
              Create new trip
            </BrutalistButton>
          </div>

          <ResponsivePlanModal
            open={sheetOpen}
            onOpenChange={(open) => {
              setSheetOpen(open);
              if (!open) setNewTripFormKey((k) => k + 1);
            }}
            title="New trip"
            description="Name your trip and choose dates. You can add pieces after."
            dialogClassName="max-h-[min(90vh,900px)] flex flex-col gap-0 p-0 overflow-hidden sm:max-w-lg"
          >
            <NewTripForm
              key={newTripFormKey}
              creating={creating}
              onSubmit={handleCreate}
              onCancel={() => setSheetOpen(false)}
            />
          </ResponsivePlanModal>

          {isLoading ? (
            <ul className="space-y-3">
              {[1, 2, 3].map((i) => (
                <li key={i}>
                  <Skeleton className="h-20 w-full rounded-none border border-border" />
                </li>
              ))}
            </ul>
          ) : tripList.length === 0 ? (
            <div className="border border-border bg-card p-8 text-center space-y-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                No trips yet. Create one to build a capsule wardrobe for your
                dates.
              </p>
              <BrutalistButton type="button" onClick={() => setSheetOpen(true)}>
                Create your first trip
              </BrutalistButton>
            </div>
          ) : (
            <ul className="space-y-3">
              {tripList.map((list) => (
                <li key={list._id}>
                  <Link
                    href={`/packing/${list._id}`}
                    className="block border border-border bg-card p-4 hover:bg-secondary/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange cursor-pointer"
                  >
                    <span className="font-medium text-sm">{list.name}</span>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                      {format(list.startDate, "MMM d, yyyy")} –{" "}
                      {format(list.endDate, "MMM d, yyyy")} ·{" "}
                      {list.garmentIds.length} pieces
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PageContainer>
      </div>
    </main>
  );
}
