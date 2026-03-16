"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { UserAvatar } from "@/components/user-avatar";
import { BrutalistInput } from "@/components/brutalist-input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

type Category = "top" | "bottom" | "shoes" | "outerwear" | "accessory";

const CATEGORIES: Category[] = [
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
];
const COLORS = [
  "Black",
  "White",
  "Grey",
  "Navy",
  "Brown",
  "Cream",
  "Indigo",
  "Olive",
  "Red",
  "Blue",
  "Green",
  "Beige",
  "Pink",
  "Yellow",
];
const STYLE_OPTIONS = [
  "minimalist",
  "classic",
  "bold",
  "trendy",
  "avant-garde",
  "casual",
];
const FIT_OPTIONS = ["oversized", "fitted", "relaxed", "tapered"];
const OCCASION_OPTIONS = [
  "casual",
  "formal",
  "work",
  "weekend",
  "night",
  "smart-casual",
];
const VERSATILITY_OPTIONS = ["high", "medium", "low"] as const;
const VIBRANCY_OPTIONS = ["muted", "balanced", "vibrant"] as const;

export default function EditGarmentPage() {
  useRequireAuth("/closet");
  const router = useRouter();
  const params = useParams();
  const id = params?.id as Id<"garments"> | undefined;
  const garment = useQuery(api.garments.getById, id ? { id } : "skip");
  const updateGarment = useMutation(api.garments.update);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [fit, setFit] = useState<string | null>(null);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [versatility, setVersatility] = useState<string | null>(null);
  const [vibrancy, setVibrancy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!garment) return;
    setName(garment.name ?? "");
    setCategory((garment.category as Category) ?? null);
    setColor(garment.primaryColor ?? null);
    setTags(garment.tags ?? []);
    setStyles(garment.style ?? []);
    setFit(garment.fit ?? null);
    setOccasions(garment.occasion ?? []);
    setVersatility(garment.versatility ?? null);
    setVibrancy(garment.vibrancy ?? null);
  }, [garment]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (!tags.includes(t)) setTags([...tags, t]);
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter((x) => x !== tag));

  const handleSave = async () => {
    if (!id || !category || !color) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateGarment({
        id,
        name: name.trim() || undefined,
        category,
        primaryColor: color,
        tags: tags.length > 0 ? tags : undefined,
        style: styles.length > 0 ? styles : undefined,
        fit: fit ?? undefined,
        occasion: occasions.length > 0 ? occasions : undefined,
        versatility: versatility ?? undefined,
        vibrancy: vibrancy ?? undefined,
      });
      toast.success("Garment updated");
      router.push("/closet");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update garment";
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (id === undefined) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <PageContainer>
          <p className="text-muted-foreground">Invalid garment.</p>
          <Link href="/closet" className="text-signal-orange hover:underline">
            Back to closet
          </Link>
        </PageContainer>
      </main>
    );
  }

  if (garment === undefined) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <PageContainer>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Loading…
          </p>
        </PageContainer>
      </main>
    );
  }

  if (garment === null) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <PageContainer>
          <p className="text-muted-foreground">Garment not found.</p>
          <Link href="/closet" className="text-signal-orange hover:underline">
            Back to closet
          </Link>
        </PageContainer>
      </main>
    );
  }

  const isComplete = category && color;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/closet"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              Back to closet
            </Link>
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
                  <Link href="/closet">Closet</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit garment</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <SectionHeader
            title="edit garment"
            subtitle={garment.name || "Update details"}
          />

          {/* Current image (read-only) */}
          <section className="mb-10 max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Current image (cannot be changed here)
            </p>
            <div className="relative aspect-[3/4] border border-border bg-secondary">
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
                    No image
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Form */}
          <section className="flex flex-col gap-10 max-w-xl">
            <BrutalistInput
              label="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cashmere crewneck"
              className="uppercase tracking-widest text-[11px] placeholder:uppercase placeholder:tracking-wider placeholder:text-[11px]"
            />

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none ${
                      category === cat
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none ${
                      color === c
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Tags (optional)
              </label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-[10px] uppercase tracking-widest border border-border"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-signal-orange transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <BrutalistInput
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type and press enter"
                className="uppercase tracking-widest text-[11px]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Traits
              </label>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Style
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setStyles((prev) =>
                            prev.includes(s)
                              ? prev.filter((x) => x !== s)
                              : [...prev, s]
                          )
                        }
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                          styles.includes(s)
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Fit
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FIT_OPTIONS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFit(f)}
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                          fit === f
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Occasion
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OCCASION_OPTIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() =>
                          setOccasions((prev) =>
                            prev.includes(o)
                              ? prev.filter((x) => x !== o)
                              : [...prev, o]
                          )
                        }
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                          occasions.includes(o)
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Versatility
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {VERSATILITY_OPTIONS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVersatility(v)}
                          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                            versatility === v
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Vibrancy
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {VIBRANCY_OPTIONS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVibrancy(v)}
                          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                            vibrancy === v
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12 border-t border-border pt-8">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {saveError ? (
                  <span className="text-destructive">{saveError}</span>
                ) : isComplete ? (
                  "Ready to save"
                ) : (
                  "Category and color required"
                )}
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isComplete || saving}
                className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-100 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isComplete && !saving
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {saving ? "Saving…" : "Update garment"}
              </button>
            </div>
          </section>
        </PageContainer>
      </div>
    </main>
  );
}
