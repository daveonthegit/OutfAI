"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { ResponsivePlanModal } from "@/components/plan-hub/responsive-plan-modal";
import { AddFromClosetPanel } from "@/components/packing/add-from-closet-panel";
import { PackedGarmentsGrid } from "@/components/packing/packed-garments-grid";
import { TripPageHeader } from "@/components/packing/trip-page-header";
import { OutfitIdeasTripSection } from "@/components/packing/outfit-ideas-trip-section";

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
        .map((gid) => {
          const item = garmentMap.get(gid as Id<"garments">);
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
      <main className="min-h-screen bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
          <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
            <Link
              href="/packing"
              className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100 cursor-pointer"
            >
              Packing
            </Link>
            <UserAvatar />
          </div>
        </header>
        <div className="pt-24 pb-24">
          <PageContainer>
            <Skeleton className="h-6 w-56 mb-4" />
            <Skeleton className="h-4 w-72 mb-10" />
            <Skeleton className="h-40 w-full mb-8" />
            <Skeleton className="h-32 w-full max-w-md" />
          </PageContainer>
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
              className="mt-4 inline-block text-signal-orange text-sm uppercase tracking-widest cursor-pointer hover:underline"
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
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/packing"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100 cursor-pointer"
          >
            Packing
          </Link>
          <UserAvatar />
        </div>
      </header>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <TripPageHeader
            tripName={trip.name}
            startDate={trip.startDate}
            endDate={trip.endDate}
          />

          <section className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-sm uppercase tracking-widest">
                Packed pieces ({trip.garmentIds.length})
              </h2>
              <BrutalistButton
                variant="outline"
                size="sm"
                onClick={() => setClosetModalOpen(true)}
                className="cursor-pointer"
              >
                Add from closet
              </BrutalistButton>
            </div>
            <PackedGarmentsGrid
              garments={packedGarments as Doc<"garments">[]}
              onRemove={removeFromTrip}
            />
          </section>

          <OutfitIdeasTripSection
            mood={mood}
            onMoodChange={setMood}
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
            displayOutfits={displayOutfits}
            tripDates={tripDates}
            onSaveLook={handleSaveLook}
            onAssignToDay={handleAssignToDay}
            generateDisabled={packedForApi.length === 0}
          />
        </PageContainer>
      </div>

      <ResponsivePlanModal
        open={closetModalOpen}
        onOpenChange={setClosetModalOpen}
        title="Add from closet"
        description="Select pieces from your closet to include on this trip."
        dialogClassName="max-h-[min(90vh,900px)] flex flex-col gap-0 p-0 overflow-hidden sm:max-w-4xl"
      >
        <AddFromClosetPanel
          closetSearch={closetSearch}
          onClosetSearchChange={setClosetSearch}
          closetCategory={closetCategory}
          onClosetCategoryChange={setClosetCategory}
          closetSort={closetSort}
          onClosetSortChange={setClosetSort}
          closetCategories={closetCategories}
          filteredCloset={filteredCloset}
          unpackedCount={unpackedGarments.length}
          selectedIds={selectedIds}
          onToggleGarment={toggleGarment}
          onAddSelected={addSelectedToTrip}
          onSelectAllShown={() =>
            setSelectedIds(new Set(filteredCloset.map((g) => g._id)))
          }
          onClearSelection={() => setSelectedIds(new Set())}
          onCancel={() => setClosetModalOpen(false)}
        />
      </ResponsivePlanModal>
    </main>
  );
}
