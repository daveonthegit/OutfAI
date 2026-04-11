"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getStaggerVariants, getCardHoverMotionProps } from "@/lib/animations";
import { PageContainer } from "@/components/layout/page-container";
import { ContentGrid } from "@/components/layout/content-grid";
import { SectionHeader } from "@/components/layout/section-header";
import { FilterBar } from "@/components/layout/filter-bar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatDistanceToNow, isThisWeek, isThisMonth } from "date-fns";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { UserAvatar } from "@/components/user-avatar";

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

interface ArchiveGarment {
  _id: Id<"garments">;
  name: string;
  category: string;
  primaryColor: string;
  imageUrl?: string;
}

interface OutfitWithGarments {
  _id: Id<"outfits">;
  _creationTime: number;
  userId: string;
  garmentIds: Id<"garments">[];
  contextMood?: string;
  contextWeather?: string;
  contextTemperature?: number;
  explanation?: string;
  savedAt: number;
  garments: Array<ArchiveGarment | null>;
}

type SortOption = "newest" | "oldest" | "mood";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  mood: "By mood",
};

function matchOutfit(outfit: OutfitWithGarments, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const mood = (outfit.contextMood ?? "").toLowerCase();
  if (mood && mood.includes(q)) return true;
  const garmentMatch = outfit.garments.some((g) => {
    if (!g) return false;
    const name = (g.name ?? "").toLowerCase();
    const cat = (g.category ?? "").toLowerCase();
    return name.includes(q) || cat.includes(q);
  });
  return garmentMatch;
}

export default function ArchivePage() {
  useRequireAuth("/archive");
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [woreThisLoadingId, setWoreThisLoadingId] =
    useState<Id<"outfits"> | null>(null);
  const [removeLoadingId, setRemoveLoadingId] = useState<Id<"outfits"> | null>(
    null
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const staggerVariants = getStaggerVariants();
  const cardHoverProps = getCardHoverMotionProps();
  const outfits = useQuery(api.outfits.list) as
    | OutfitWithGarments[]
    | undefined;
  const removeOutfit = useMutation(api.outfits.remove);
  const logRecommendation = useMutation(api.recommendationLogs.log);

  const uniqueMoods = useMemo(() => {
    if (!outfits?.length) return [];
    const set = new Set<string>();
    outfits.forEach((o) => {
      const m = o.contextMood?.trim();
      if (m) set.add(m);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [outfits]);

  const filteredAndSorted = useMemo(() => {
    if (!outfits?.length) return [];
    let list = outfits.filter((o) => matchOutfit(o, searchQuery));
    if (filterMood !== "all") {
      list = list.filter(
        (o) => (o.contextMood ?? "").toLowerCase() === filterMood.toLowerCase()
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "newest") return b.savedAt - a.savedAt;
      if (sortBy === "oldest") return a.savedAt - b.savedAt;
      const moodA = (a.contextMood ?? "").toLowerCase();
      const moodB = (b.contextMood ?? "").toLowerCase();
      return moodA.localeCompare(moodB) || b.savedAt - a.savedAt;
    });
    return list;
  }, [outfits, searchQuery, filterMood, sortBy]);

  const groupedByTime = useMemo(() => {
    const week: OutfitWithGarments[] = [];
    const month: OutfitWithGarments[] = [];
    const older: OutfitWithGarments[] = [];
    const now = Date.now();
    filteredAndSorted.forEach((o) => {
      const t = o.savedAt;
      if (isThisWeek(t)) week.push(o);
      else if (isThisMonth(t)) month.push(o);
      else older.push(o);
    });
    return { week, month, older };
  }, [filteredAndSorted]);

  const handleRemove = async (id: Id<"outfits">, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoveLoadingId(id);
    try {
      await removeOutfit({ id });
    } finally {
      setRemoveLoadingId(null);
    }
  };

  const handleWoreThis = async (
    outfit: OutfitWithGarments,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setWoreThisLoadingId(outfit._id);
    try {
      await logRecommendation({
        action: "worn",
        outfitId: outfit._id,
        garmentIds: outfit.garmentIds.map(String),
        mood: outfit.contextMood,
        weather: outfit.contextWeather,
      });
    } finally {
      setWoreThisLoadingId(null);
    }
  };

  const filtersActive =
    searchQuery.trim() !== "" || filterMood !== "all" || sortBy !== "newest";

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterMood("all");
    setSortBy("newest");
  };

  const handleViewOutfit = (outfit: OutfitWithGarments) => {
    router.push(`/outfit?saved=${outfit._id}&source=archive`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <Link
                href="/closet"
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
              >
                Closet
              </Link>
              <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
                Archive
              </span>
            </nav>
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <SectionHeader title="archive" subtitle="Your saved looks" />

          {outfits === undefined ? (
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Loading…
            </p>
          ) : outfits.length === 0 ? (
            <section className="text-center py-20">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                No saved looks yet
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-signal-orange transition-colors duration-100"
              >
                Create your first look
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </section>
          ) : (
            <>
              {/* Toolbar — FilterBar (UI/UX audit) */}
              <FilterBar
                search={{
                  value: searchQuery,
                  onChange: setSearchQuery,
                  placeholder: "Search by piece or mood…",
                  "aria-label": "Search saved looks",
                }}
                sort={{
                  value: sortBy,
                  onChange: (v) => setSortBy(v as SortOption),
                  options: (Object.keys(SORT_LABELS) as SortOption[]).map(
                    (key) => ({ value: key, label: SORT_LABELS[key] })
                  ),
                  "aria-label": "Sort order",
                }}
                chips={{
                  options: uniqueMoods.map((m) => ({ value: m, label: m })),
                  value: filterMood,
                  onChange: setFilterMood,
                  allLabel: "All",
                }}
                onClearAll={handleClearFilters}
                showClearAll={filtersActive}
                resultSummary={
                  filteredAndSorted.length < (outfits?.length ?? 0)
                    ? `Showing ${filteredAndSorted.length} of ${outfits?.length ?? 0} looks`
                    : undefined
                }
              />

              {filteredAndSorted.length === 0 ? (
                <section className="text-center py-12">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    No looks match your search or filters. Try changing them.
                  </p>
                </section>
              ) : (
                <motion.div
                  ref={gridRef}
                  variants={staggerVariants.container}
                  initial="hidden"
                  animate="visible"
                  className="space-y-12"
                >
                  {[
                    {
                      key: "week",
                      title: "This week",
                      items: groupedByTime.week,
                    },
                    {
                      key: "month",
                      title: "This month",
                      items: groupedByTime.month,
                    },
                    {
                      key: "older",
                      title: "Older",
                      items: groupedByTime.older,
                    },
                  ].map((group) =>
                    group.items.length > 0 ? (
                      <section key={group.key}>
                        <h2 className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-4">
                          {group.title}
                        </h2>
                        <ContentGrid variant="cards">
                          {group.items.map((outfit) => {
                            const sortedGarments = sortGarmentsByCategory(
                              outfit.garments.filter(
                                Boolean
                              ) as ArchiveGarment[]
                            );
                            const isHovered = hoveredId === outfit._id;
                            return (
                              <motion.div
                                key={outfit._id}
                                variants={staggerVariants.item}
                                {...cardHoverProps}
                                className="group relative w-full aspect-square border border-border bg-card hover:bg-secondary/50 transition-colors duration-100 overflow-hidden text-left origin-center"
                                onMouseEnter={() => setHoveredId(outfit._id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                  opacity:
                                    hoveredId !== null && !isHovered ? 0.5 : 1,
                                  transition: "opacity 100ms",
                                  ...(cardHoverProps.style as React.CSSProperties),
                                }}
                              >
                                {/* I wore this + Remove — always visible for touch / keyboard (not hover-only) */}
                                <div className="absolute top-2 right-2 left-2 z-20 flex justify-between gap-2 pointer-events-none">
                                  <button
                                    type="button"
                                    onClick={(e) => handleWoreThis(outfit, e)}
                                    disabled={woreThisLoadingId === outfit._id}
                                    className="pointer-events-auto p-1.5 bg-background/90 border border-border hover:border-signal-orange hover:text-signal-orange transition-colors text-[9px] uppercase tracking-widest disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none"
                                  >
                                    {woreThisLoadingId === outfit._id
                                      ? "…"
                                      : "I wore this"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleRemove(outfit._id, e)}
                                    disabled={removeLoadingId === outfit._id}
                                    className="pointer-events-auto p-1.5 bg-background/90 border border-border hover:border-destructive hover:text-destructive transition-colors text-[9px] uppercase tracking-widest disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none"
                                  >
                                    {removeLoadingId === outfit._id
                                      ? "…"
                                      : "Remove"}
                                  </button>
                                </div>

                                {/* Clickable area: same square layout as recommendation options */}
                                <button
                                  type="button"
                                  className="absolute inset-0 w-full h-full flex flex-col"
                                  onClick={() => handleViewOutfit(outfit)}
                                >
                                  <div className="w-full h-full relative flex-1 min-h-0">
                                    {sortedGarments.length === 1 ? (
                                      <div className="absolute inset-0 relative">
                                        {sortedGarments[0].imageUrl ? (
                                          <Image
                                            src={sortedGarments[0].imageUrl}
                                            alt={sortedGarments[0].name}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : (
                                          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                              {sortedGarments[0].category}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 w-full h-full absolute inset-0">
                                        {sortedGarments
                                          .slice(0, 4)
                                          .map((garment, idx) => (
                                            <div
                                              key={garment._id}
                                              className="relative bg-secondary border-l border-t border-border"
                                            >
                                              {garment.imageUrl ? (
                                                <Image
                                                  src={garment.imageUrl}
                                                  alt={garment.name}
                                                  fill
                                                  className="object-cover"
                                                />
                                              ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                                    {garment.category}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Summary: always on small screens; hover expand on md+ */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-background/95 px-4 py-4 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-100 motion-reduce:transition-none">
                                    <p className="text-[11px] uppercase tracking-widest text-foreground mb-2">
                                      Saved{" "}
                                      {formatDistanceToNow(
                                        new Date(outfit.savedAt),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </p>
                                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                                      {sortedGarments.length} pieces
                                    </p>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-signal-orange cursor-pointer hover:underline">
                                      Click to view
                                    </span>
                                  </div>
                                </button>
                              </motion.div>
                            );
                          })}
                        </ContentGrid>
                      </section>
                    ) : null
                  )}
                </motion.div>
              )}
            </>
          )}
        </PageContainer>
      </div>
    </main>
  );
}
