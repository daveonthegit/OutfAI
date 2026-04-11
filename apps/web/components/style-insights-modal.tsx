"use client";

import { useMemo } from "react";
import type { StyleInsight } from "@shared/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const sections = useMemo(
    () => buildSections(gaps, completeTheLook, styleTips),
    [gaps, completeTheLook, styleTips]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        )}
        overlayClassName="bg-[#050505]/60 backdrop-blur-md"
      >
        <DialogHeader className="space-y-1 border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-xl md:text-2xl">
            Style insights
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Gaps, complete-the-look tips, and pairing ideas
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {sections.map((section, sectionIndex) => (
              <section key={sectionIndex}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                    {section.heading}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="group">
                      <p className="text-sm leading-relaxed text-foreground">
                        {item.title}
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
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

        <div className="border-t border-border bg-secondary/30 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Based on your wardrobe
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="size-1.5 shrink-0 bg-[var(--acid-lime)]"
                aria-hidden
              />
              <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                AI analysis
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
