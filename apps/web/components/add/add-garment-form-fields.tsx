"use client";

import { BrutalistInput } from "@/components/brutalist-input";
import {
  ADD_CATEGORIES,
  ADD_COLORS,
  FIT_OPTIONS,
  OCCASION_OPTIONS,
  STYLE_OPTIONS,
  VERSATILITY_OPTIONS,
  VIBRANCY_OPTIONS,
  type AddCategory,
} from "@/components/add/add-garment-constants";
import { TagSuggestions } from "@/components/add/tag-suggestions";
import { getDefaultTagsForGarment } from "@shared/garment-default-tags";

type AddGarmentFormFieldsProps = {
  garmentName: string;
  onGarmentNameChange: (v: string) => void;
  selectedCategory: AddCategory | null;
  onSelectCategory: (c: AddCategory) => void;
  selectedColor: string | null;
  onSelectColor: (c: string) => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (v: string) => void;
  onAddTagKeyDown: (e: React.KeyboardEvent) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  selectedStyles: string[];
  onToggleStyle: (s: string) => void;
  selectedFit: string | null;
  onSelectFit: (f: string) => void;
  selectedOccasions: string[];
  onToggleOccasion: (o: string) => void;
  selectedVersatility: string | null;
  onSelectVersatility: (v: (typeof VERSATILITY_OPTIONS)[number]) => void;
  selectedVibrancy: string | null;
  onSelectVibrancy: (v: (typeof VIBRANCY_OPTIONS)[number]) => void;
  analysisReview?: {
    category?: AddCategory | null;
    color?: string | null;
    tags: string[];
    style: string[];
    fit?: string | null;
    occasion: string[];
    versatility?: string | null;
    vibrancy?: string | null;
  } | null;
};

export function AddGarmentFormFields({
  garmentName,
  onGarmentNameChange,
  selectedCategory,
  onSelectCategory,
  selectedColor,
  onSelectColor,
  tags,
  tagInput,
  onTagInputChange,
  onAddTagKeyDown,
  onAddTag,
  onRemoveTag,
  selectedStyles,
  onToggleStyle,
  selectedFit,
  onSelectFit,
  selectedOccasions,
  onToggleOccasion,
  selectedVersatility,
  onSelectVersatility,
  selectedVibrancy,
  onSelectVibrancy,
  analysisReview,
}: AddGarmentFormFieldsProps) {
  const normalizedTags = new Set(tags.map((tag) => tag.toLowerCase()));
  const defaultSuggestions =
    selectedCategory && selectedColor
      ? getDefaultTagsForGarment(
          selectedCategory,
          selectedColor.toLowerCase(),
          undefined
        ).filter((tag) => !normalizedTags.has(tag.toLowerCase()))
      : [];
  const analysisTagSuggestions =
    analysisReview?.tags.filter(
      (tag) => !normalizedTags.has(tag.toLowerCase())
    ) ?? [];

  return (
    <section className="flex flex-col gap-10">
      {analysisReview && (
        <div className="border border-foreground bg-secondary/30 px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            AI review
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Image analysis filled in the fields below. Review the suggestions,
            remove anything that feels off, then save when the garment looks
            right.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p>
              Category:{" "}
              <span className="font-medium text-foreground">
                {analysisReview.category ?? "No suggestion"}
              </span>
            </p>
            <p>
              Color:{" "}
              <span className="font-medium text-foreground">
                {analysisReview.color ?? "No suggestion"}
              </span>
            </p>
            <p>
              Style:{" "}
              <span className="font-medium text-foreground">
                {analysisReview.style.join(", ") || "No suggestion"}
              </span>
            </p>
            <p>
              Occasion:{" "}
              <span className="font-medium text-foreground">
                {analysisReview.occasion.join(", ") || "No suggestion"}
              </span>
            </p>
          </div>
        </div>
      )}

      <BrutalistInput
        label="Name (optional)"
        type="text"
        value={garmentName}
        onChange={(e) => onGarmentNameChange(e.target.value)}
        placeholder="e.g. Cashmere crewneck"
        className="bg-transparent uppercase tracking-widest text-[11px] placeholder:uppercase placeholder:tracking-wider placeholder:text-[11px]"
      />

      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {ADD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 cursor-pointer ${
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

      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {ADD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 cursor-pointer ${
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

      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
          Tags <span className="text-muted-foreground/50">(optional)</span>
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
                  onClick={() => onRemoveTag(tag)}
                  className="hover:text-signal-orange transition-colors duration-100 cursor-pointer"
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
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={onAddTagKeyDown}
          placeholder="Type and press enter"
          className="bg-transparent uppercase tracking-widest text-[11px] placeholder:uppercase placeholder:tracking-wider placeholder:text-[11px]"
        />

        <TagSuggestions
          label={
            analysisTagSuggestions.length ? "AI tag suggestions" : undefined
          }
          tags={
            analysisTagSuggestions.length
              ? analysisTagSuggestions
              : defaultSuggestions
          }
          onAddTag={onAddTag}
          onAddAll={() =>
            (analysisTagSuggestions.length
              ? analysisTagSuggestions
              : defaultSuggestions
            ).forEach(onAddTag)
          }
        />
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
          Traits
        </label>

        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
            Style
          </p>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onToggleStyle(s)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 cursor-pointer ${
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

        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
            Fit
          </p>
          <div className="flex flex-wrap gap-2">
            {FIT_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onSelectFit(f)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 cursor-pointer ${
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

        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
            Occasion
          </p>
          <div className="flex flex-wrap gap-2">
            {OCCASION_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onToggleOccasion(o)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 cursor-pointer ${
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

        <div className="flex gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
              Versatility
            </p>
            <div className="flex flex-wrap gap-2">
              {VERSATILITY_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onSelectVersatility(v)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 cursor-pointer ${
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
                  type="button"
                  onClick={() => onSelectVibrancy(v)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-100 cursor-pointer ${
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
  );
}
