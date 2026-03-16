"use client";

import { useState, useEffect } from "react";
import type { Mood } from "@shared/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface MoodOption {
  id: Mood;
  label: string;
  accent: string;
  description: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "bold",
    label: "Bold",
    accent: "var(--signal-orange)",
    description: "Confident, statement-making",
  },
  {
    id: "minimalist",
    label: "Minimal",
    accent: "var(--chrome-silver)",
    description: "Clean, understated",
  },
  {
    id: "casual",
    label: "Casual",
    accent: "var(--foreground)",
    description: "Effortless, comfortable",
  },
  {
    id: "formal",
    label: "Formal",
    accent: "var(--foreground)",
    description: "Precise, professional",
  },
  {
    id: "adventurous",
    label: "Adventurous",
    accent: "var(--acid-lime)",
    description: "Boundary-pushing, creative",
  },
  {
    id: "cozy",
    label: "Cozy",
    accent: "var(--electric-blue)",
    description: "Comfortable, warm",
  },
  {
    id: "energetic",
    label: "Energetic",
    accent: "var(--signal-orange)",
    description: "Bright, dynamic",
  },
];

interface MoodSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMood: Mood;
  onSelect: (mood: Mood) => void;
}

export function MoodSelectModal({
  open,
  onOpenChange,
  currentMood,
  onSelect,
}: MoodSelectModalProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(currentMood);
  const [hoveredMood, setHoveredMood] = useState<Mood | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedMood(currentMood);
    }
  }, [open, currentMood]);

  const activeMood = MOOD_OPTIONS.find(
    (m) => m.id === (hoveredMood ?? selectedMood ?? currentMood)
  );

  const handleApply = () => {
    const moodToApply = selectedMood ?? currentMood;
    onSelect(moodToApply);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedMood(currentMood);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl w-[calc(100vw-2rem)] p-0 gap-0 overflow-hidden",
          "bg-card border-2 border-border shadow-2xl ring-1 ring-black/20 dark:ring-white/10",
          "rounded-xl sm:rounded-2xl"
        )}
        overlayClassName="bg-black/70 backdrop-blur-md"
        showCloseButton={true}
      >
        {/* Header: visible title + prompt, with space for close button */}
        <DialogHeader className="relative px-6 pt-6 pb-4 pr-12 border-b border-border">
          <DialogTitle className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Select mood
          </DialogTitle>
          <p className="font-serif text-2xl sm:text-3xl italic text-foreground leading-tight">
            how do you{" "}
            <span
              className="transition-colors duration-200"
              style={{
                color: activeMood
                  ? activeMood.accent
                  : "var(--muted-foreground)",
              }}
            >
              feel today
            </span>
          </p>
        </DialogHeader>

        {/* Mood grid */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[min(50vh,20rem)] overflow-y-auto">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setSelectedMood(mood.id)}
                onMouseEnter={() => setHoveredMood(mood.id)}
                onMouseLeave={() => setHoveredMood(null)}
                className={cn(
                  "relative text-left px-4 py-4 sm:py-5 border transition-all duration-100 rounded-md",
                  selectedMood === mood.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted/30 hover:border-foreground hover:bg-muted/50"
                )}
              >
                <div
                  className="absolute top-0 left-0 w-full h-[2px] rounded-t-md transition-all duration-100"
                  style={{
                    backgroundColor:
                      selectedMood === mood.id || hoveredMood === mood.id
                        ? mood.accent
                        : "transparent",
                  }}
                />
                <span
                  className={cn(
                    "block font-serif text-lg sm:text-xl italic mb-1",
                    selectedMood === mood.id
                      ? "text-background"
                      : "text-foreground"
                  )}
                >
                  {mood.label}
                </span>
                <span
                  className={cn(
                    "block text-[10px] uppercase tracking-[0.2em]",
                    selectedMood === mood.id
                      ? "text-background/70"
                      : "text-muted-foreground"
                  )}
                >
                  {mood.description}
                </span>
              </button>
            ))}
          </div>

          {/* Footer: selected label + Apply */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-4">
            {selectedMood ? (
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Selected:{" "}
                <span className="text-foreground">
                  {MOOD_OPTIONS.find((m) => m.id === selectedMood)?.label ??
                    selectedMood}
                </span>
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleApply}
              className="ml-auto px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-foreground text-background hover:bg-foreground/90 transition-all duration-100 rounded-md"
            >
              Apply
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
