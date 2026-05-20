"use client";

import { cn } from "@/lib/utils";

type AddGarmentSaveBarProps = {
  saveError: string | null;
  isComplete: boolean;
  saving: boolean;
  onSave: () => void;
  className?: string;
};

export function AddGarmentSaveBar({
  saveError,
  isComplete,
  saving,
  onSave,
  className,
}: AddGarmentSaveBarProps) {
  return (
    <section
      className={cn(
        "sticky bottom-24 z-10 mt-12 border-t border-border bg-background pb-4 pt-8 lg:static lg:bottom-auto lg:pb-0",
        className
      )}
    >
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
          type="button"
          onClick={onSave}
          disabled={!isComplete || saving}
          className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-100 cursor-pointer ${
            isComplete && !saving
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          {saving ? "Saving…" : "Add to closet"}
        </button>
      </div>
    </section>
  );
}
