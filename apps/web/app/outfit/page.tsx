"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/components/layout/page-container";
import { ContentGrid } from "@/components/layout/content-grid";
import { SectionHeader } from "@/components/layout/section-header";
import { formatDistanceToNow } from "date-fns";

const GARMENT_CATEGORY_ORDER = [
  "top",
  "outerwear",
  "bottom",
  "shoes",
  "accessory",
] as const;

function sortGarmentsByCategory<T extends { category: string }>(
  garments: T[]
): T[] {
  const rank = (c: string) => {
    const i = GARMENT_CATEGORY_ORDER.indexOf(
      c as (typeof GARMENT_CATEGORY_ORDER)[number]
    );
    return i === -1 ? GARMENT_CATEGORY_ORDER.length : i;
  };
  return [...garments].sort((a, b) => rank(a.category) - rank(b.category));
}

type GarmentTile = {
  src: string;
  name: string;
  type: string;
  id?: Id<"garments">;
  color?: string;
  traits?: {
    style?: string[];
    fit?: string;
    occasion?: string[];
    versatility?: string;
    vibrancy?: string;
  };
};

type NormalizedOutfit = {
  label: string;
  garments: GarmentTile[];
  garmentIds: Id<"garments">[];
  explanation?: string;
  contextMood?: string;
  contextWeather?: string;
  contextTemperature?: number;
};

function OutfitContent() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<GarmentTile | null>(
    null
  );
  const [savedOutfitId, setSavedOutfitId] = useState<Id<"outfits"> | null>(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const saveOutfit = useMutation(api.outfits.save);

  const previewId = searchParams.get("preview");
  const savedId = searchParams.get("saved");
  const legacyOutfit = searchParams.get("outfit");

  const preview = useQuery(
    api.outfitPreviews.get,
    previewId ? { id: previewId as Id<"outfitPreviews"> } : ("skip" as const)
  );
  const saved = useQuery(
    api.outfits.getWithGarments,
    savedId ? { id: savedId as Id<"outfits"> } : ("skip" as const)
  );

  const normalized = useMemo((): NormalizedOutfit | null | "invalid" => {
    if (previewId) {
      if (preview === undefined) return null;
      if (preview === null) return "invalid";
      const sorted = sortGarmentsByCategory(
        preview.garments.filter(Boolean) as Array<{
          _id: Id<"garments">;
          name: string;
          category: string;
          primaryColor: string;
          imageUrl?: string;
          style?: string[];
          fit?: string;
          occasion?: string[];
          versatility?: string;
          vibrancy?: string;
        }>
      );
      return {
        label: preview.label,
        garmentIds: preview.garmentIds,
        explanation: preview.explanation,
        contextMood: preview.contextMood,
        contextWeather: preview.contextWeather,
        contextTemperature: preview.contextTemperature,
        garments: sorted.map((g) => ({
          id: g._id,
          src: g.imageUrl ?? "",
          name: g.name,
          type: g.category,
          color: g.primaryColor,
          traits: {
            style: g.style,
            fit: g.fit,
            occasion: g.occasion,
            versatility: g.versatility,
            vibrancy: g.vibrancy,
          },
        })),
      };
    }

    if (savedId) {
      if (saved === undefined) return null;
      if (saved === null) return "invalid";
      const sorted = sortGarmentsByCategory(
        saved.garments.filter(Boolean) as Array<{
          _id: Id<"garments">;
          name: string;
          category: string;
          primaryColor: string;
          imageUrl?: string;
          style?: string[];
          fit?: string;
          occasion?: string[];
          versatility?: string;
          vibrancy?: string;
        }>
      );
      return {
        label: `Saved ${formatDistanceToNow(new Date(saved.savedAt), { addSuffix: true })}`,
        garmentIds: saved.garmentIds,
        explanation: saved.explanation,
        contextMood: saved.contextMood,
        contextWeather: saved.contextWeather,
        contextTemperature: saved.contextTemperature,
        garments: sorted.map((g) => ({
          id: g._id,
          src: g.imageUrl ?? "",
          name: g.name,
          type: g.category,
          color: g.primaryColor,
          traits: {
            style: g.style,
            fit: g.fit,
            occasion: g.occasion,
            versatility: g.versatility,
            vibrancy: g.vibrancy,
          },
        })),
      };
    }

    if (legacyOutfit) {
      try {
        const parsed = JSON.parse(legacyOutfit) as {
          label?: string;
          garments?: GarmentTile[];
          garmentIds?: string[];
          explanation?: string;
          contextMood?: string;
          contextWeather?: string;
          contextTemperature?: number;
        };
        const garmentIds = (parsed.garmentIds ?? [])
          .filter(Boolean)
          .map((id) => id as Id<"garments">);
        return {
          label: parsed.label ?? "Outfit",
          garments: parsed.garments ?? [],
          garmentIds,
          explanation: parsed.explanation,
          contextMood: parsed.contextMood,
          contextWeather: parsed.contextWeather,
          contextTemperature: parsed.contextTemperature,
        };
      } catch {
        return "invalid";
      }
    }

    return "invalid";
  }, [previewId, preview, savedId, saved, legacyOutfit]);

  if (normalized === null) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
          <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
            <Link
              href="/"
              className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors"
            >
              OutfAI
            </Link>
          </div>
        </header>
        <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
          <PageContainer>
            <p className="text-muted-foreground">Loading…</p>
          </PageContainer>
        </div>
      </main>
    );
  }

  if (normalized === "invalid") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
          <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
            <Link
              href="/"
              className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors"
            >
              OutfAI
            </Link>
          </div>
        </header>
        <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
          <PageContainer>
            <p className="text-muted-foreground">No outfit selected</p>
            <Link href="/" className="text-signal-orange hover:underline">
              Back to recommendations
            </Link>
          </PageContainer>
        </div>
      </main>
    );
  }

  const outfit = normalized;

  const source = searchParams.get("source");
  const backHref = source === "archive" ? "/archive" : "/";
  const backLabel = source === "archive" ? "Back to Archive" : "Back to Today";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            OutfAI
          </Link>
          <Link
            href={backHref}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {backLabel}
          </Link>
        </div>
      </header>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <SectionHeader
            title={outfit.label}
            subtitle={`${outfit.garments.length} pieces`}
          />

          {outfit.explanation && (
            <section className="mb-12 md:mb-16 border-t border-b border-border py-6">
              <p className="text-[11px] leading-relaxed text-muted-foreground max-w-2xl">
                {outfit.explanation}
              </p>
            </section>
          )}

          <section className="mb-16">
            <ContentGrid variant="tiles">
              {outfit.garments.map((garment, index) => (
                <div
                  key={garment.id ?? index}
                  className="relative border border-border bg-card transition-all duration-100 cursor-pointer"
                  style={{
                    opacity:
                      hoveredId !== null && hoveredId !== index ? 0.5 : 1,
                  }}
                  onMouseEnter={() => setHoveredId(index)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedGarment(garment)}
                >
                  <div className="aspect-square relative bg-secondary">
                    <Image
                      src={garment.src || "/placeholder.svg"}
                      alt={garment.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div
                    className="absolute bottom-0 left-0 right-0 bg-background/95 px-3 py-3 transition-all duration-100"
                    style={{
                      transform:
                        hoveredId === index
                          ? "translateY(0)"
                          : "translateY(100%)",
                    }}
                  >
                    <p className="text-[11px] uppercase tracking-widest text-foreground mb-1">
                      {garment.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {garment.type}
                      </span>
                    </div>
                  </div>

                  <div
                    className="absolute top-0 left-0 w-0.5 h-full transition-colors duration-100"
                    style={{
                      backgroundColor:
                        hoveredId === index
                          ? "var(--signal-orange)"
                          : "transparent",
                    }}
                  />
                </div>
              ))}
            </ContentGrid>
          </section>

          {selectedGarment && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/50"
              onClick={() => setSelectedGarment(null)}
            >
              <div
                className="bg-background border border-border max-w-md w-full p-6 rounded shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full aspect-square bg-secondary mb-4">
                  <Image
                    src={selectedGarment.src || "/placeholder.svg"}
                    alt={selectedGarment.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {selectedGarment.name}
                </h3>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Type: {selectedGarment.type}
                </p>
                {selectedGarment.color && (
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Color: {selectedGarment.color}
                  </p>
                )}
                {selectedGarment.traits && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Traits
                    </p>
                    <ul className="text-[11px]">
                      <li>
                        <strong>Style:</strong>{" "}
                        {Array.isArray(selectedGarment.traits.style)
                          ? selectedGarment.traits.style.join(", ")
                          : selectedGarment.traits.style}
                      </li>
                      <li>
                        <strong>Fit:</strong> {selectedGarment.traits.fit}
                      </li>
                      <li>
                        <strong>Occasion:</strong>{" "}
                        {Array.isArray(selectedGarment.traits.occasion)
                          ? selectedGarment.traits.occasion.join(", ")
                          : selectedGarment.traits.occasion}
                      </li>
                      <li>
                        <strong>Versatility:</strong>{" "}
                        {selectedGarment.traits.versatility}
                      </li>
                      <li>
                        <strong>Vibrancy:</strong>{" "}
                        {selectedGarment.traits.vibrancy}
                      </li>
                    </ul>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedGarment(null)}
                    className="px-3 py-2 text-[11px] uppercase tracking-[0.2em] border border-border hover:bg-secondary transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className="border-t border-border pt-10">
            {saveError && (
              <p className="text-[11px] text-destructive mb-2">{saveError}</p>
            )}
            <button
              type="button"
              onClick={async () => {
                const garmentIds = outfit.garmentIds;
                if (!garmentIds || garmentIds.length === 0) {
                  setSaveError(
                    "This look can’t be saved from here. Save it from the main page."
                  );
                  return;
                }
                setSaveError(null);
                try {
                  const id = await saveOutfit({
                    garmentIds,
                    contextMood: outfit.contextMood,
                    contextWeather: outfit.contextWeather,
                    contextTemperature: outfit.contextTemperature,
                    explanation: outfit.explanation,
                  });
                  setSavedOutfitId(id);
                } catch (e) {
                  setSaveError(
                    e instanceof Error ? e.message : "Failed to save look"
                  );
                }
              }}
              disabled={!!savedOutfitId}
              className="text-[11px] uppercase tracking-[0.25em] text-foreground hover:text-signal-orange transition-colors duration-100 group flex items-center gap-2 disabled:opacity-60 disabled:cursor-default"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-100 group-hover:scale-110"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {savedOutfitId ? "Saved!" : "Save Look"}
            </button>
          </section>
        </PageContainer>
      </div>
    </main>
  );
}

export default function OutfitPage() {
  return (
    <Suspense fallback={null}>
      <OutfitContent />
    </Suspense>
  );
}
