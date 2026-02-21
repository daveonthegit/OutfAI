"use client";

import React from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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
];

export default function AddGarmentPage() {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
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

  const isComplete = previewUrl && selectedCategory && selectedColor;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <Link
            href="/"
            className="text-base md:text-lg tracking-tight font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <Link
            href="/closet"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            Back to closet
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Title */}
        <section className="mb-12 md:mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl italic text-foreground leading-[0.9] tracking-tight mb-3">
            add garment
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Expand your archive
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
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
              <button
                onClick={() => setPreviewUrl(null)}
                className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-signal-orange transition-colors duration-100"
              >
                Remove image
              </button>
            )}
          </section>

          {/* Form inputs */}
          <section className="flex flex-col gap-10">
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
                        onClick={() => removeTag(tag)}
                        className="hover:text-signal-orange transition-colors duration-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type and press enter"
                className="w-full bg-transparent border border-border px-4 py-3 text-[11px] uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-100"
              />
            </div>
          </section>
        </div>

        {/* Add action - inline */}
        <section className="mt-12 border-t border-border pt-8">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {isComplete ? "Ready to add" : "Complete all fields"}
            </span>
            <button
              disabled={!isComplete}
              className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-100 ${
                isComplete
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              Add to closet
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
