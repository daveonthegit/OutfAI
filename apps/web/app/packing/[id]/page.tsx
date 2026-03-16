"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { format, eachDayOfInterval } from "date-fns";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { UserAvatar } from "@/components/user-avatar";
import { BrutalistButton } from "@/components/brutalist-button";
import { useOutfitRecommendations } from "@/hooks/use-outfit-recommendations";
import { OutfitRecommendationCard } from "@/components/outfit-recommendation-card";
import type {
  Mood,
  WeatherCondition,
  GarmentCategory,
  Garment,
} from "@shared/types";
import type {
  DisplayOutfit,
  DisplayGarment,
} from "@/components/home/authenticated-home";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/** Map Convex garment doc to API Garment shape for recommendations */
function convexGarmentToApi(g: Doc<"garments"> & { _creationTime?: number }): {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  primaryColor: string;
  tags: string[];
  style?: string[];
  fit?: string;
  occasion?: string[];
  versatility?: string;
  vibrancy?: string;
  imageUrl?: string;
  createdAt: Date;
} {
  return {
    id: g._id,
    userId: g.userId,
    name: g.name,
    category: g.category as GarmentCategory,
    primaryColor: g.primaryColor,
    tags: g.tags ?? [],
    style: g.style,
    fit: g.fit,
    occasion: g.occasion,
    versatility: g.versatility,
    vibrancy: g.vibrancy,
    imageUrl: g.imageUrl,
    createdAt: new Date(
      (g as { _creationTime?: number })._creationTime ?? Date.now()
    ),
  };
}

export default function PackingTripPage() {
  const params = useParams();
  const id = params.id as Id<"packingLists">;
  useRequireAuth("/packing");

  const trip = useQuery(api.packingLists.get, { id });
  const allGarments = useQuery(api.garments.list) ?? [];
  const updateList = useMutation(api.packingLists.update);
  const saveOutfit = useMutation(api.outfits.save);
  const assignPlan = useMutation(api.outfitPlans.assign);
  const currentUser = useQuery(api.auth.getCurrentUser);

  const [closetModalOpen, setClosetModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<Id<"garments">>>(
    new Set()
  );
  const [mood, setMood] = useState<Mood>("casual");
  const [closetSearch, setClosetSearch] = useState("");
  const [closetCategory, setClosetCategory] = useState<string>("all");
  const [closetSort, setClosetSort] = useState<"category" | "name">("category");
  const [assignDayForIndex, setAssignDayForIndex] = useState<number | null>(
    null
  );

  const packedGarments = useMemo(() => trip?.garments ?? [], [trip]);
  const packedIdSet = useMemo(
    () => new Set(trip?.garmentIds ?? []),
    [trip?.garmentIds]
  );
  const unpackedGarments = useMemo(
    () =>
      allGarments.filter((g) => !packedIdSet.has(g._id)) as Doc<"garments">[],
    [allGarments, packedIdSet]
  );
  const closetCategories = useMemo(() => {
    const set = new Set(unpackedGarments.map((g) => g.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [unpackedGarments]);
  const filteredCloset = useMemo(() => {
    let list = unpackedGarments;
    if (closetSearch.trim()) {
      const q = closetSearch.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          (g.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (closetCategory !== "all") {
      list = list.filter((g) => g.category === closetCategory);
    }
    list = [...list].sort((a, b) =>
      closetSort === "category"
        ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name)
    );
    return list;
  }, [unpackedGarments, closetSearch, closetCategory, closetSort]);
  const tripDates = useMemo(() => {
    if (!trip) return [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = eachDayOfInterval({ start, end });
    return days.map((d) => ({
      dateStr: format(d, "yyyy-MM-dd"),
      label: format(d, "EEE, MMM d"),
    }));
  }, [trip]);
  const packedForApi = useMemo(
    (): Garment[] =>
      packedGarments.map((g) =>
        convexGarmentToApi(g as Doc<"garments"> & { _creationTime?: number })
      ) as Garment[],
    [packedGarments]
  );

  const { outfits, loading, error, generate } = useOutfitRecommendations({
    userId: currentUser?._id ?? "",
    mood,
    weather: "cloudy" as WeatherCondition,
    temperature: 15,
  });

  const toggleGarment = (gId: Id<"garments">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(gId)) next.delete(gId);
      else next.add(gId);
      return next;
    });
  };

  const addSelectedToTrip = async () => {
    if (!trip) return;
    const current = new Set(trip.garmentIds);
    selectedIds.forEach((gId) => current.add(gId));
    try {
      await updateList({ id, garmentIds: Array.from(current) });
      setClosetModalOpen(false);
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to update trip");
    }
  };

  const removeFromTrip = async (gId: Id<"garments">) => {
    if (!trip) return;
    const next = trip.garmentIds.filter((x) => x !== gId);
    try {
      await updateList({ id, garmentIds: next });
    } catch {
      toast.error("Failed to update trip");
    }
  };

  const handleGenerate = () => {
    if (packedForApi.length === 0) {
      toast.error("Add at least one garment to the trip first.");
      return;
    }
    generate({
      garments: packedForApi,
      mood,
      weather: "cloudy",
      temperature: 15,
      limitCount: 6,
    });
  };

  const handleSaveLook = async (index: number) => {
    const outfit = displayOutfits[index];
    if (!outfit?.garments?.length) return;
    const garmentIds = outfit.garments.map((g) => g.id) as Id<"garments">[];
    try {
      await saveOutfit({
        garmentIds,
        contextMood: outfit.contextMood ?? mood,
        contextWeather: outfit.contextWeather ?? "cloudy",
        contextTemperature: 15,
        explanation: outfit.explanation,
      });
      toast.success("Look saved to Archive");
    } catch {
      toast.error("Failed to save look");
    }
  };

  const handleAssignToDay = async (outfitIndex: number, dateStr: string) => {
    const outfit = displayOutfits[outfitIndex];
    if (!outfit?.garments?.length) return;
    setAssignDayForIndex(null);
    const garmentIds = outfit.garments.map((g) => g.id) as Id<"garments">[];
    try {
      const outfitId = await saveOutfit({
        garmentIds,
        contextMood: outfit.contextMood ?? mood,
        contextWeather: outfit.contextWeather ?? "cloudy",
        contextTemperature: 15,
        explanation: outfit.explanation,
      });
      await assignPlan({ date: dateStr, outfitId });
      toast.success(`Assigned to ${format(new Date(dateStr), "MMM d")}`);
    } catch {
      toast.error("Failed to assign to day");
    }
  };

  const displayOutfits: DisplayOutfit[] = useMemo(() => {
    if (!outfits?.length || !trip) return [];
    const garmentMap = new Map(
      packedGarments
        .filter((g): g is Doc<"garments"> => g != null)
        .map((g) => [g._id, g])
    );
    return outfits.map((outfit, index) => {
      const garments: DisplayGarment[] = (outfit.garmentIds ?? [])
        .map((id) => {
          const item = garmentMap.get(id as Id<"garments">);
          if (!item) return null;
          return {
            id: item._id,
            src: item.imageUrl ?? "",
            name: item.name,
            category: item.category,
            type: item.category,
            color: item.primaryColor,
            traits: {
              style: item.style,
              fit: item.fit,
              occasion: item.occasion,
              versatility: item.versatility,
              vibrancy: item.vibrancy,
            },
          };
        })
        .filter(Boolean) as DisplayGarment[];
      return {
        label: `Option ${index + 1}`,
        garments,
        explanation: outfit.explanation ?? "",
        contextMood: mood,
        contextWeather: "cloudy",
        scoreBreakdown: outfit.scoreBreakdown,
      };
    });
  }, [outfits, trip, packedGarments, mood]);

  if (trip === undefined) {
    return (
      <main className="min-h-screen bg-background">
        <div className="pt-24 pb-24 flex justify-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Loading…
          </p>
        </div>
      </main>
    );
  }

  if (trip === null) {
    return (
      <main className="min-h-screen bg-background">
        <div className="pt-24 pb-24">
          <PageContainer>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Trip not found.
            </p>
            <Link
              href="/packing"
              className="mt-4 inline-block text-signal-orange text-sm uppercase tracking-widest"
            >
              Back to packing
            </Link>
          </PageContainer>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/packing"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            Packing
          </Link>
          <UserAvatar />
        </div>
      </header>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <h1 className="font-serif text-3xl italic mb-1">{trip.name}</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
            {format(trip.startDate, "MMM d, yyyy")} –{" "}
            {format(trip.endDate, "MMM d, yyyy")}
          </p>

          <section className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-sm uppercase tracking-widest">
                Packed pieces ({trip.garmentIds.length})
              </h2>
              <BrutalistButton
                variant="outline"
                size="sm"
                onClick={() => setClosetModalOpen(true)}
              >
                Add from closet
              </BrutalistButton>
            </div>
            {packedGarments.length === 0 ? (
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground border border-border p-6">
                No pieces yet. Add from your closet to build outfits.
              </p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(packedGarments as Array<Doc<"garments">>).map((g) => (
                  <li
                    key={g._id}
                    className="relative border border-border bg-card group"
                  >
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
                    <p className="p-2 text-[11px] uppercase truncate">
                      {g.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromTrip(g._id)}
                      className="absolute top-1 right-1 p-1 bg-background/90 border border-border text-[9px] uppercase hover:border-destructive hover:text-destructive"
                      aria-label={`Remove ${g.name} from trip`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mb-8">
            <label className="block text-[11px] uppercase tracking-widest mb-2">
              Mood for outfit ideas
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as Mood)}
              className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
              aria-label="Mood"
            >
              {[
                "casual",
                "formal",
                "adventurous",
                "cozy",
                "energetic",
                "minimalist",
                "bold",
              ].map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
            <BrutalistButton
              className="mt-4"
              onClick={handleGenerate}
              disabled={loading || packedForApi.length === 0}
            >
              {loading ? "Generating…" : "Generate outfits from packed pieces"}
            </BrutalistButton>
            {error && (
              <p className="mt-2 text-[11px] text-destructive">{error}</p>
            )}
          </section>

          {displayOutfits.length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-widest mb-4">
                Outfit ideas
              </h2>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayOutfits.map((outfit, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <OutfitRecommendationCard
                        label={outfit.label}
                        garments={outfit.garments}
                        explanation={outfit.explanation}
                        contextMood={outfit.contextMood}
                        contextWeather={outfit.contextWeather}
                        scoreBreakdown={outfit.scoreBreakdown}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveLook(i)}
                          className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border hover:border-signal-orange hover:text-signal-orange transition-colors"
                        >
                          Save look
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setAssignDayForIndex(
                                assignDayForIndex === i ? null : i
                              )
                            }
                            className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border hover:border-signal-orange hover:text-signal-orange transition-colors"
                            aria-expanded={assignDayForIndex === i}
                            aria-haspopup="listbox"
                          >
                            Assign to day…
                          </button>
                          {assignDayForIndex === i && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                aria-hidden="true"
                                onClick={() => setAssignDayForIndex(null)}
                              />
                              <ul
                                role="listbox"
                                className="absolute left-0 top-full mt-1 z-50 min-w-[200px] max-h-48 overflow-y-auto border border-border bg-background py-1 shadow-lg"
                              >
                                {tripDates.map(({ dateStr, label }) => (
                                  <li key={dateStr} role="option">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAssignToDay(i, dateStr)
                                      }
                                      className="w-full text-left px-3 py-2 text-[11px] uppercase tracking-wider hover:bg-secondary focus:bg-secondary outline-none"
                                    >
                                      {label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </PageContainer>
      </div>

      {closetModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/95 flex flex-col p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-from-closet-title"
        >
          <h2
            id="add-from-closet-title"
            className="text-sm uppercase tracking-widest mb-4"
          >
            Add from closet
          </h2>
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="search"
              placeholder="Search by name or category…"
              value={closetSearch}
              onChange={(e) => setClosetSearch(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.12em] placeholder:text-muted-foreground outline-none focus:border-signal-orange/60"
              aria-label="Search closet"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setClosetCategory("all")}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors ${
                  closetCategory === "all"
                    ? "border-signal-orange text-signal-orange bg-signal-orange/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {closetCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setClosetCategory(cat)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors ${
                    closetCategory === cat
                      ? "border-signal-orange text-signal-orange bg-signal-orange/10"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Sort:
              </span>
              <select
                value={closetSort}
                onChange={(e) =>
                  setClosetSort(e.target.value as "category" | "name")
                }
                className="rounded border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider outline-none focus:border-signal-orange/60"
                aria-label="Sort by"
              >
                <option value="category">Category</option>
                <option value="name">Name</option>
              </select>
              {filteredCloset.length < unpackedGarments.length && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {filteredCloset.length} of {unpackedGarments.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredCloset.map((g) => {
              const isSelected = selectedIds.has(g._id);
              return (
                <button
                  key={g._id}
                  type="button"
                  onClick={() => toggleGarment(g._id)}
                  className={`border p-2 text-left transition-colors ${
                    isSelected
                      ? "border-signal-orange bg-signal-orange/10"
                      : "border-border hover:border-signal-orange"
                  }`}
                >
                  <div className="aspect-square relative mb-1">
                    {g.imageUrl ? (
                      <Image
                        src={g.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
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
          {unpackedGarments.length === 0 && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground py-4">
              All closet items are already in this trip.
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
            <BrutalistButton
              onClick={addSelectedToTrip}
              disabled={selectedIds.size === 0}
            >
              Add {selectedIds.size} to trip
            </BrutalistButton>
            <button
              type="button"
              onClick={() => {
                const toSelect = new Set(filteredCloset.map((g) => g._id));
                setSelectedIds(toSelect);
              }}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border hover:border-signal-orange text-foreground"
            >
              Select all shown
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </button>
            <BrutalistButton
              variant="ghost"
              onClick={() => setClosetModalOpen(false)}
            >
              Cancel
            </BrutalistButton>
          </div>
        </div>
      )}
    </main>
  );
}
