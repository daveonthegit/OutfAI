"use client";

type HomeOutfitSelectionToolbarProps = {
  selectedCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onSaveSelected: () => void;
  isSaving: boolean;
};

export function HomeOutfitSelectionToolbar({
  selectedCount,
  allSelected,
  onToggleSelectAll,
  onSaveSelected,
  isSaving,
}: HomeOutfitSelectionToolbarProps) {
  return (
    <section className="mb-6 flex flex-wrap items-center justify-between gap-3 glass-panel rounded-sm px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-foreground">
          {selectedCount === 0 ? "None selected" : `${selectedCount} selected`}
        </span>
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 underline underline-offset-2 cursor-pointer"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      {selectedCount > 0 && (
        <button
          type="button"
          onClick={onSaveSelected}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] bg-signal-orange text-background border border-signal-orange hover:opacity-90 transition-colors duration-100 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
                <path d="M21 12a9 9 0 01-9-9" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Save {selectedCount} look{selectedCount !== 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </section>
  );
}
