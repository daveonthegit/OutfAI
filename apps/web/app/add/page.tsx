"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SplitPane } from "@/components/layout/split-pane";
import { SectionHeader } from "@/components/layout/section-header";
import { UserAvatar } from "@/components/user-avatar";
import { BrutalistInput } from "@/components/brutalist-input";
import { getDefaultTagsForGarment } from "@shared/garment-default-tags";
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

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB hard limit before compression
const TARGET_DIMENSION = 2160; // px on longest side — downscale only, always re-encode
const JPEG_QUALITY = 0.82;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64 ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      const longest = Math.max(width, height);
      if (longest > TARGET_DIMENSION) {
        const scale = TARGET_DIMENSION / longest;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export default function AddGarmentPage() {
  useRequireAuth("/add");
  const router = useRouter();
  const createGarment = useMutation(api.garments.create);
  const generateUploadUrl = useMutation(api.garments.generateUploadUrl);

  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [garmentName, setGarmentName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedVersatility, setSelectedVersatility] = useState<string | null>(
    null
  );
  const [selectedVibrancy, setSelectedVibrancy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-suggest tags from category and color (rules-based; issue #39).
  // When both are set, pre-fill tags; user can add or remove before submit.
  useEffect(() => {
    if (selectedCategory && selectedColor) {
      setTags(
        getDefaultTagsForGarment(selectedCategory, selectedColor, undefined)
      );
    }
  }, [selectedCategory, selectedColor]);

  const handleAnalyzeImage = useCallback(async () => {
    if (!selectedFile) return;
    setAnalyzeError(null);
    setAnalyzeLoading(true);
    try {
      const imageBase64 = await fileToBase64(selectedFile);
      const res = await fetch("/api/analyze-garment-image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Analysis failed (${res.status})`);
      }
      const result = await res.json();
      setSelectedCategory(result.category);
      setSelectedColor(result.color);
      setTags(result.tags ?? []);
      setSelectedStyles(result.style ?? []);
      setSelectedFit(result.fit);
      setSelectedOccasions(result.occasion ?? []);
      setSelectedVersatility(result.versatility);
      setSelectedVibrancy(result.vibrancy);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Image analysis failed";
      setAnalyzeError(message);
    } finally {
      setAnalyzeLoading(false);
    }
  }, [selectedFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_FILE_BYTES) {
      setAnalyzeError(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`
      );
      return;
    }
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    setPreviewUrl(url);
    setSelectedFile(compressed);
    setAnalyzeError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!selectedCategory || !selectedColor) return;
    setSaving(true);
    setSaveError(null);
    try {
      let storageId: Id<"_storage"> | undefined;
      if (selectedFile) {
        const uploadUrl = await generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        if (!uploadRes.ok) {
          throw new Error(`Image upload failed (${uploadRes.status})`);
        }
        const { storageId: id } = await uploadRes.json();
        storageId = id as Id<"_storage">;
      }
      await createGarment({
        name: garmentName || `${selectedColor} ${selectedCategory}`,
        category: selectedCategory,
        primaryColor: selectedColor,
        tags,
        style: selectedStyles.length > 0 ? selectedStyles : undefined,
        fit: selectedFit ?? undefined,
        occasion: selectedOccasions.length > 0 ? selectedOccasions : undefined,
        versatility: selectedVersatility ?? undefined,
        vibrancy: selectedVibrancy ?? undefined,
        storageId,
      });
      toast.success("Garment added");
      router.push("/closet");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save garment";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const isComplete = selectedCategory && selectedColor;

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

      {/* Main content */}
      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <SectionHeader title="add garment" subtitle="Expand your archive" />

          <SplitPane leftFraction="2/5">
            {/* Upload area */}
            <section>
              <div
                className={`relative aspect-[3/4] border-2 border-dashed transition-all duration-100 cursor-pointer ${
                  dragActive
                    ? "border-signal-orange bg-signal-orange/5"
                    : previewUrl
                      ? "border-border"
                      : "border-border hover:border-foreground"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-muted-foreground mb-4"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Drop image here
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
                      or click to browse
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {previewUrl && (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={analyzeLoading}
                    className="text-[10px] uppercase tracking-[0.2em] text-signal-orange hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {analyzeLoading ? "Analyzing…" : "Auto-fill from image"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      setAnalyzeError(null);
                    }}
                    className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-signal-orange transition-colors duration-100"
                  >
                    Remove image
                  </button>
                  {analyzeError && (
                    <span className="text-[10px] text-destructive">
                      {analyzeError}
                    </span>
                  )}
                </div>
              )}
            </section>

            {/* Form inputs */}
            <section className="flex flex-col gap-10">
              {/* Name — BrutalistInput (UI/UX audit) */}
              <BrutalistInput
                label="Name (optional)"
                type="text"
                value={garmentName}
                onChange={(e) => setGarmentName(e.target.value)}
                placeholder="e.g. Cashmere crewneck"
                className="bg-transparent uppercase tracking-widest text-[11px] placeholder:uppercase placeholder:tracking-wider placeholder:text-[11px]"
              />

              {/* Category */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 ${
                        selectedCategory === cat
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 ${
                        selectedColor === color
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                  Tags{" "}
                  <span className="text-muted-foreground/50">(optional)</span>
                </label>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-[10px] uppercase tracking-widest text-secondary-foreground border border-border"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-signal-orange transition-colors duration-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <BrutalistInput
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type and press enter"
                  className="bg-transparent uppercase tracking-widest text-[11px] placeholder:uppercase placeholder:tracking-wider placeholder:text-[11px]"
                />
              </div>

              {/* Traits - style, fit, occasion, versatility, vibrancy */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                  Traits
                </label>

                {/* Styles (multi-select) */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Style
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setSelectedStyles((prev) =>
                            prev.includes(s)
                              ? prev.filter((p) => p !== s)
                              : [...prev, s]
                          )
                        }
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                          selectedStyles.includes(s)
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fit (single-select) */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Fit
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FIT_OPTIONS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFit(f)}
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                          selectedFit === f
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion (multi-select) */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Occasion
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OCCASION_OPTIONS.map((o) => (
                      <button
                        key={o}
                        onClick={() =>
                          setSelectedOccasions((prev) =>
                            prev.includes(o)
                              ? prev.filter((p) => p !== o)
                              : [...prev, o]
                          )
                        }
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                          selectedOccasions.includes(o)
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Versatility + Vibrancy (single-select) */}
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Versatility
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {VERSATILITY_OPTIONS.map((v) => (
                        <button
                          key={v}
                          onClick={() => setSelectedVersatility(v)}
                          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                            selectedVersatility === v
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
                          onClick={() => setSelectedVibrancy(v)}
                          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 ${
                            selectedVibrancy === v
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
            </section>
          </SplitPane>

          {/* Add action — sticky on small viewports above bottom nav (UI/UX audit) */}
          <section className="mt-12 border-t border-border pt-8 sticky bottom-24 z-10 bg-background pb-4 lg:bottom-auto lg:pb-0 lg:static">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {saveError ? (
                  <span className="text-destructive">{saveError}</span>
                ) : isComplete ? (
                  "Ready to add"
                ) : (
                  "Complete all fields"
                )}
              </span>
              <button
                onClick={handleSave}
                disabled={!isComplete || saving}
                className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-100 ${
                  isComplete && !saving
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {saving ? "Saving…" : "Add to closet"}
              </button>
            </div>
          </section>
        </PageContainer>
      </div>
    </main>
  );
}
