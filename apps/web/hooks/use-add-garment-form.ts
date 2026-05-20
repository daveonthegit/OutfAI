"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getDefaultTagsForGarment } from "@shared/garment-default-tags";
import { toast } from "sonner";
import {
  compressImage,
  fileToBase64,
  MAX_FILE_BYTES,
} from "@/lib/add/garment-image";
import type { AddCategory } from "@/components/add/add-garment-constants";

type UseAddGarmentFormOptions = {
  onSaved?: () => void;
  successMessage?: string;
};

type AnalysisReview = {
  category?: AddCategory | null;
  color?: string | null;
  tags: string[];
  style: string[];
  fit?: string | null;
  occasion: string[];
  versatility?: string | null;
  vibrancy?: string | null;
};

export function useAddGarmentForm({
  onSaved,
  successMessage = "Garment added",
}: UseAddGarmentFormOptions = {}) {
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
  const [analysisReview, setAnalysisReview] = useState<AnalysisReview | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoAnalyzedFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (selectedCategory && selectedColor) {
      setTags(
        getDefaultTagsForGarment(selectedCategory, selectedColor, undefined)
      );
    }
  }, [selectedCategory, selectedColor]);

  const resetForm = useCallback(() => {
    setDragActive(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setAnalyzeLoading(false);
    setAnalyzeError(null);
    setSelectedCategory(null);
    setSelectedColor(null);
    setGarmentName("");
    setTags([]);
    setTagInput("");
    setSelectedStyles([]);
    setSelectedFit(null);
    setSelectedOccasions([]);
    setSelectedVersatility(null);
    setSelectedVibrancy(null);
    setSaving(false);
    setSaveError(null);
    setAnalysisReview(null);
    autoAnalyzedFileRef.current = null;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
      const review: AnalysisReview = {
        category: result.category,
        color: result.color,
        tags: result.tags ?? [],
        style: result.style ?? [],
        fit: result.fit,
        occasion: result.occasion ?? [],
        versatility: result.versatility,
        vibrancy: result.vibrancy,
      };
      setSelectedCategory(result.category);
      setSelectedColor(result.color);
      setTags(result.tags ?? []);
      setSelectedStyles(result.style ?? []);
      setSelectedFit(result.fit);
      setSelectedOccasions(result.occasion ?? []);
      setSelectedVersatility(result.versatility);
      setSelectedVibrancy(result.vibrancy);
      setAnalysisReview(review);
      toast.success("Image suggestions are ready to review.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Image analysis failed";
      setAnalyzeError(message);
    } finally {
      setAnalyzeLoading(false);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) {
      autoAnalyzedFileRef.current = null;
      return;
    }
    if (autoAnalyzedFileRef.current === selectedFile) return;
    autoAnalyzedFileRef.current = selectedFile;
    void handleAnalyzeImage();
  }, [selectedFile, handleAnalyzeImage]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_FILE_BYTES) {
        setAnalyzeError(
          `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`
        );
        return;
      }
      const compressed = await compressImage(file);
      const url = URL.createObjectURL(compressed);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      setSelectedFile(compressed);
      setAnalyzeError(null);
    },
    [previewUrl]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void handleFile(e.target.files[0]);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const nextTag = tagInput.trim().toLowerCase();
      if (!tags.includes(nextTag)) {
        setTags([...tags, nextTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addTag = useCallback((tag: string) => {
    const nextTag = tag.trim().toLowerCase();
    if (!nextTag) return;
    setTags((prev) => (prev.includes(nextTag) ? prev : [...prev, nextTag]));
  }, []);

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
      toast.success(successMessage);
      resetForm();
      onSaved?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save garment";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

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

  return {
    fileInputRef,
    dragActive,
    previewUrl,
    analyzeLoading,
    analyzeError,
    selectedCategory,
    selectedColor,
    garmentName,
    tags,
    tagInput,
    selectedStyles,
    selectedFit,
    selectedOccasions,
    selectedVersatility,
    selectedVibrancy,
    saving,
    saveError,
    analysisReview,
    isComplete: !!(selectedCategory && selectedColor),
    setGarmentName,
    setSelectedCategory,
    setSelectedColor,
    setTagInput,
    setSelectedFit,
    setSelectedVersatility,
    setSelectedVibrancy,
    handleDrag,
    handleDrop,
    handleInputChange,
    handleAnalyzeImage,
    handleAddTag,
    handleSave,
    addTag,
    removeTag,
    resetForm,
    toggleStyle,
    toggleOccasion,
    clearImage: () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      setAnalyzeError(null);
      setAnalysisReview(null);
    },
  };
}

export type AddGarmentFormState = ReturnType<typeof useAddGarmentForm>;
