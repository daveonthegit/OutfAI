"use client";

import { useEffect, useMemo, useRef } from "react";
import type { StyleInsight } from "@shared/types";
import { cn } from "@/lib/utils";

interface StyleInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gaps: StyleInsight[];
  completeTheLook: StyleInsight[];
  styleTips: StyleInsight[];
}

function buildSections(
  gaps: StyleInsight[],
  completeTheLook: StyleInsight[],
  styleTips: StyleInsight[]
): { heading: string; items: { title: string; description: string }[] }[] {
  const sections: {
    heading: string;
    items: { title: string; description: string }[];
  }[] = [];
  if (gaps.length > 0) {
    sections.push({
      heading: "Wardrobe gaps",
      items: gaps.map((i) => ({ title: i.text, description: i.reason ?? "" })),
    });
  }
  if (completeTheLook.length > 0) {
    sections.push({
      heading: "Complete the look",
      items: completeTheLook.map((i) => ({
        title: i.text,
        description: i.reason ?? "",
      })),
    });
  }
  if (styleTips.length > 0) {
    sections.push({
      heading: "Style tips",
      items: styleTips.map((i) => ({
        title: i.text,
        description: i.reason ?? "",
      })),
    });
  }
  return sections;
}

export function StyleInsightsModal({
  isOpen,
  onClose,
  gaps,
  completeTheLook,
  styleTips,
}: StyleInsightsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const sections = useMemo(
    () => buildSections(gaps, completeTheLook, styleTips),
    [gaps, completeTheLook, styleTips]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-lg bg-card border border-border",
          "max-h-[85vh] overflow-hidden flex flex-col",
          "animate-in slide-in-from-bottom-4 duration-200 md:slide-in-from-bottom-0 md:fade-in md:zoom-in-95"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-serif italic text-xl md:text-2xl text-foreground">
              Style insights
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Gaps, complete-the-look tips, and pairing ideas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-100"
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {sections.map((section, sectionIndex) => (
              <section key={sectionIndex}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                    {section.heading}
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="group">
                      <p className="text-sm text-foreground leading-relaxed">
                        {item.title}
                      </p>
                      {item.description ? (
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Based on your wardrobe
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-acid-lime" />
              <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                AI Analysis
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
