"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { getDefaultTagsForGarment } from "@shared/garment-default-tags";
import { toast } from "sonner";
import {
  fileToBase64,
  compressImage,
  MAX_FILE_BYTES,
} from "@/lib/add/garment-image";
import { AddGarmentUploadPanel } from "@/components/add/add-garment-upload-panel";
import { AddGarmentFormFields } from "@/components/add/add-garment-form-fields";
import { AddGarmentSaveBar } from "@/components/add/add-garment-save-bar";
import type { AddCategory } from "@/components/add/add-garment-constants";
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
  const [selectedCategory, setSelectedCategory] = useState<AddCategory | null>(
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
      void handleFile(e.dataTransfer.files[0]);
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
      void handleFile(e.target.files[0]);
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

  const isComplete = !!(selectedCategory && selectedColor);

  const toggleStyle = (s: string) => {
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s]
    );
  };

  const toggleOccasion = (o: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(o) ? prev.filter((p) => p !== o) : [...prev, o]
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
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

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <SectionHeader title="add garment" subtitle="Expand your archive" />

          <SplitPane leftFraction="2/5">
            <AddGarmentUploadPanel
              fileInputRef={fileInputRef}
              dragActive={dragActive}
              previewUrl={previewUrl}
              analyzeLoading={analyzeLoading}
              analyzeError={analyzeError}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileInputChange={handleInputChange}
              onAnalyze={() => void handleAnalyzeImage()}
              onClearImage={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
                setAnalyzeError(null);
              }}
            />

            <AddGarmentFormFields
              garmentName={garmentName}
              onGarmentNameChange={setGarmentName}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              tags={tags}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onAddTagKeyDown={handleAddTag}
              onRemoveTag={removeTag}
              selectedStyles={selectedStyles}
              onToggleStyle={toggleStyle}
              selectedFit={selectedFit}
              onSelectFit={setSelectedFit}
              selectedOccasions={selectedOccasions}
              onToggleOccasion={toggleOccasion}
              selectedVersatility={selectedVersatility}
              onSelectVersatility={(v) => setSelectedVersatility(v)}
              selectedVibrancy={selectedVibrancy}
              onSelectVibrancy={(v) => setSelectedVibrancy(v)}
            />
          </SplitPane>

          <AddGarmentSaveBar
            saveError={saveError}
            isComplete={isComplete}
            saving={saving}
            onSave={() => void handleSave()}
          />
        </PageContainer>
      </div>
    </main>
  );
}
