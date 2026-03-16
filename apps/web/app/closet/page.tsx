"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getStaggerVariants } from "@/lib/animations";
import { PageContainer } from "@/components/layout/page-container";
import { ContentGrid } from "@/components/layout/content-grid";
import { SectionHeader } from "@/components/layout/section-header";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Category = "all" | "top" | "bottom" | "shoes" | "outerwear" | "accessory";

interface ConvexGarment {
  _id: Id<"garments">;
  _creationTime: number;
  userId: string;
  name: string;
  category: string;
  primaryColor: string;
  tags: string[];
  style?: string[];
  fit?: string;
  occasion?: string[];
  versatility?: string;
  vibrancy?: string;
  imageUrl?: string;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "shoes", label: "Shoes" },
  { key: "outerwear", label: "Outerwear" },
  { key: "accessory", label: "Accessory" },
];

export default function ClosetPage() {
  useRequireAuth("/closet");

  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<ConvexGarment | null>(
    null
  );

  // Selection mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Id<"garments">[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const staggerVariants = getStaggerVariants();

  const garmentsRaw = useQuery(api.garments.list);
  const garments = garmentsRaw ?? [];
  const removeMany = useMutation(api.garments.removeMany);
  const removeSingle = useMutation(api.garments.remove);

  const filteredItems =
    activeCategory === "all"
      ? garments
      : garments.filter(
          (item: ConvexGarment) => item.category === activeCategory
        );

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => !prev);
    setSelectedIds(new Set());
    setHoveredId(null);
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(
      new Set(filteredItems.map((item: ConvexGarment) => item._id))
    );
  }, [filteredItems]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleGridItemClick = useCallback(
    (item: ConvexGarment) => {
      if (isSelectMode) {
        toggleItem(item._id);
      } else {
        setSelectedGarment(item);
      }
    },
    [isSelectMode, toggleItem]
  );

  const requestDelete = useCallback((ids: Id<"garments">[]) => {
    setDeletingIds(ids);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      if (deletingIds.length === 1) {
        await removeSingle({ id: deletingIds[0] });
        toast.success("Item removed");
      } else {
        await removeMany({ ids: deletingIds });
        toast.success(`${deletingIds.length} items removed`);
      }
      setSelectedIds(new Set());
      setIsSelectMode(false);
      setSelectedGarment(null);
    } catch {
      toast.error("Could not remove. Try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingIds([]);
    }
  }, [deletingIds, removeSingle, removeMany]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeletingIds([]);
  }, []);

  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item: ConvexGarment) => selectedIds.has(item._id));

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
                Closet
              </span>
              <Link
                href="/archive"
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
              >
                Archive
              </Link>
            </nav>
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <SectionHeader title="closet" subtitle="What you already own" />

          {/* Filter chips + Select toggle */}
          <section className="mb-10 md:mb-14">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveCategory(cat.key);
                      setSelectedIds(new Set());
                    }}
                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 ${
                      activeCategory === cat.key
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {garments.length > 0 && (
                <button
                  onClick={toggleSelectMode}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 ${
                    isSelectMode
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {isSelectMode ? "Cancel" : "Select"}
                </button>
              )}
            </div>
          </section>

          {/* Selection toolbar */}
          {isSelectMode && (
            <section className="mb-6 flex items-center justify-between border border-border px-4 py-3">
              <div className="flex items-center gap-4">
                <span className="text-[11px] uppercase tracking-[0.2em] text-foreground">
                  {selectedIds.size === 0
                    ? "None selected"
                    : `${selectedIds.size} selected`}
                </span>
                <button
                  onClick={allFilteredSelected ? deselectAll : selectAll}
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 underline underline-offset-2"
                >
                  {allFilteredSelected ? "Deselect all" : "Select all"}
                </button>
              </div>
              {selectedIds.size > 0 && (
                <button
                  onClick={() =>
                    requestDelete(
                      [...selectedIds].map((id) => id as Id<"garments">)
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] bg-red-600 text-white border border-red-600 hover:bg-red-700 transition-colors duration-100"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Delete {selectedIds.size}
                </button>
              )}
            </section>
          )}

          {/* Garment Grid */}
          <section className="mb-16">
            {garmentsRaw === undefined ? (
              <ContentGrid variant="tiles">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-square w-full rounded-none border border-border"
                  />
                ))}
              </ContentGrid>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  No garments yet
                </p>
                <Link
                  href="/add"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-signal-orange transition-colors duration-100"
                >
                  Add your first piece
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
              </div>
            ) : (
              <motion.div
                ref={gridRef}
                variants={staggerVariants.container}
                initial="hidden"
                animate="visible"
              >
                <ContentGrid variant="tiles">
                  {filteredItems.map((item: ConvexGarment) => {
                    const isSelected = selectedIds.has(item._id);
                    const isHovered = hoveredId === item._id;
                    const dimmed =
                      !isSelectMode && hoveredId !== null && !isHovered;

                    return (
                      <motion.div
                        key={item._id}
                        variants={staggerVariants.item}
                        className="relative border border-border bg-card transition-all duration-100 cursor-pointer"
                        style={{ opacity: dimmed ? 0.5 : 1 }}
                        onMouseEnter={() =>
                          !isSelectMode && setHoveredId(item._id)
                        }
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => handleGridItemClick(item)}
                      >
                        {/* Image */}
                        <div className="aspect-square relative bg-secondary">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className={`object-cover transition-all duration-100 ${
                                isSelectMode && isSelected
                                  ? "brightness-75"
                                  : ""
                              }`}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                {item.category}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Selection checkbox overlay */}
                        {isSelectMode && (
                          <div className="absolute top-2 right-2 z-10">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${
                                isSelected
                                  ? "bg-signal-orange border-signal-orange"
                                  : "bg-background/80 border-border"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  className="text-background"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Selected full-border highlight */}
                        {isSelectMode && isSelected && (
                          <div className="absolute inset-0 border-2 border-signal-orange pointer-events-none" />
                        )}

                        {/* Info overlay on hover (only outside select mode) */}
                        {!isSelectMode && (
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-background/95 px-3 py-3 transition-all duration-100"
                            style={{
                              transform: isHovered
                                ? "translateY(0)"
                                : "translateY(100%)",
                            }}
                          >
                            <p className="text-[11px] uppercase tracking-widest text-foreground mb-1">
                              {item.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                {item.category}
                              </span>
                              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                {item.primaryColor}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Name label in select mode */}
                        {isSelectMode && (
                          <div className="px-3 py-2 border-t border-border">
                            <p className="text-[10px] uppercase tracking-widest text-foreground truncate">
                              {item.name}
                            </p>
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                              {item.category}
                            </span>
                          </div>
                        )}

                        {/* Accent line (non-select mode hover) */}
                        {!isSelectMode && (
                          <div
                            className="absolute top-0 left-0 w-0.5 h-full transition-colors duration-100"
                            style={{
                              backgroundColor: isHovered
                                ? "var(--signal-orange)"
                                : "transparent",
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </ContentGrid>
              </motion.div>
            )}
          </section>

          {/* Add garment action */}
          <section className="border-t border-border pt-10">
            <Link
              href="/add"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 group"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add garment
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-100 group-hover:translate-x-1"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </section>
        </PageContainer>
      </div>

      {/* Garment detail modal */}
      {selectedGarment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedGarment(null)}
        >
          <div
            className="bg-background border border-border max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal image */}
            <div className="relative w-full aspect-square bg-secondary">
              {selectedGarment.imageUrl ? (
                <Image
                  src={selectedGarment.imageUrl}
                  alt={selectedGarment.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    No image
                  </span>
                </div>
              )}
            </div>

            {/* Modal content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-medium tracking-tight mb-1">
                    {selectedGarment.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {selectedGarment.category}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {selectedGarment.primaryColor}
                    </span>
                  </div>
                </div>
              </div>

              {(selectedGarment.style ||
                selectedGarment.fit ||
                selectedGarment.occasion ||
                selectedGarment.versatility ||
                selectedGarment.vibrancy) && (
                <div className="mb-6 border-t border-border pt-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Traits
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {selectedGarment.style && (
                      <>
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Style
                        </dt>
                        <dd className="text-[11px] text-foreground">
                          {selectedGarment.style.join(", ")}
                        </dd>
                      </>
                    )}
                    {selectedGarment.fit && (
                      <>
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Fit
                        </dt>
                        <dd className="text-[11px] text-foreground">
                          {selectedGarment.fit}
                        </dd>
                      </>
                    )}
                    {selectedGarment.occasion && (
                      <>
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Occasion
                        </dt>
                        <dd className="text-[11px] text-foreground">
                          {selectedGarment.occasion.join(", ")}
                        </dd>
                      </>
                    )}
                    {selectedGarment.versatility && (
                      <>
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Versatility
                        </dt>
                        <dd className="text-[11px] text-foreground">
                          {selectedGarment.versatility}
                        </dd>
                      </>
                    )}
                    {selectedGarment.vibrancy && (
                      <>
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Vibrancy
                        </dt>
                        <dd className="text-[11px] text-foreground">
                          {selectedGarment.vibrancy}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {selectedGarment.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGarment.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-[9px] uppercase tracking-widest border border-border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <button
                  onClick={() => requestDelete([selectedGarment._id])}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-red-500 hover:text-red-400 transition-colors duration-100"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Delete
                </button>
                <button
                  onClick={() => setSelectedGarment(null)}
                  className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] border border-border hover:bg-secondary transition-colors duration-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
          onClick={cancelDelete}
        >
          <div
            className="bg-background border border-border max-w-sm w-full mx-4 p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-medium tracking-tight mb-2">
              {deletingIds.length === 1
                ? "Delete garment?"
                : `Delete ${deletingIds.length} garments?`}
            </h3>
            <p className="text-[11px] text-muted-foreground mb-6">
              {deletingIds.length === 1
                ? "This garment will be permanently removed from your closet."
                : `${deletingIds.length} garments will be permanently removed from your closet.`}
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] border border-border hover:bg-secondary transition-colors duration-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] bg-red-600 text-white hover:bg-red-700 transition-colors duration-100 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        opacity="0.25"
                      />
                      <path d="M21 12a9 9 0 01-9-9" />
                    </svg>
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
