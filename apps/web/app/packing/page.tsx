"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { DateRange } from "react-day-picker";
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
import { TripDateRangePicker } from "@/components/ui/trip-date-range-picker";
import { toast } from "sonner";

export default function PackingPage() {
  useRequireAuth("/packing");
  const lists = useQuery(api.packingLists.list) ?? [];
  const createList = useMutation(api.packingLists.create);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setShowForm(false);
      setName("");
      setDateRange(undefined);
      window.location.href = `/packing/${id}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setCreating(false);
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
            <BrutalistButton onClick={() => setShowForm(true)}>
              Create new trip
            </BrutalistButton>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreate}
              className="border border-border p-6 mb-8 bg-card"
            >
              <h3 className="text-sm uppercase tracking-widest mb-4">
                New trip
              </h3>
              <label className="block mb-2 text-[11px] uppercase tracking-widest">
                Trip name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weekend away"
                className="w-full border border-border bg-background px-3 py-2 text-sm mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
                aria-label="Trip name"
              />
              <TripDateRangePicker
                label="Trip dates"
                placeholder="Select start and end date"
                value={dateRange}
                onChange={setDateRange}
                minDate={new Date()}
                id="trip-dates"
                className="mb-4"
              />
              <div className="flex gap-3">
                <BrutalistButton type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create trip"}
                </BrutalistButton>
                <BrutalistButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setName("");
                    setDateRange(undefined);
                  }}
                >
                  Cancel
                </BrutalistButton>
              </div>
            </form>
          )}

          {lists.length === 0 && !showForm ? (
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              No trips yet. Create one to build a capsule wardrobe.
            </p>
          ) : (
            <ul className="space-y-3">
              {lists.map((list) => (
                <li key={list._id}>
                  <Link
                    href={`/packing/${list._id}`}
                    className="block border border-border bg-card p-4 hover:bg-secondary/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
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
