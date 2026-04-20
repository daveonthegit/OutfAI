"use client";

type OutfitActionButtonsProps = {
  onSkip?: () => void;
  onSave?: () => void;
  onWorn?: () => void;
  isSaving?: boolean;
};

/**
 * Save / Skip / Worn actions for a recommendation card. Keyboard: S, X, W (handled on card focus).
 */
export function OutfitActionButtons({
  onSkip,
  onSave,
  onWorn,
  isSaving,
}: OutfitActionButtonsProps) {
  if (!onSkip && !onSave && !onWorn) return null;

  return (
    <div className="absolute top-2 left-2 right-2 z-10 flex justify-between gap-2 flex-wrap">
      {onSkip && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSkip();
          }}
          className="p-1.5 glass-bar border-border hover:border-foreground hover:text-foreground transition-colors text-[9px] uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
          aria-label="Skip this outfit"
        >
          Skip
        </button>
      )}
      <div className="flex gap-2 ml-auto">
        {onWorn && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWorn();
            }}
            className="p-1.5 glass-bar border-border hover:border-foreground hover:text-foreground transition-colors text-[9px] uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
            aria-label="Mark as worn"
          >
            Worn
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave();
            }}
            disabled={isSaving}
            className="p-1.5 glass-bar border-signal-orange/60 text-signal-orange hover:bg-signal-orange/10 transition-colors text-[9px] uppercase tracking-widest disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
            aria-label={isSaving ? "Saving…" : "Save this outfit"}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
