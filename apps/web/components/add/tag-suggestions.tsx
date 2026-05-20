"use client";

type TagSuggestionsProps = {
  label?: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onAddAll?: () => void;
};

export function TagSuggestions({
  label = "Suggested tags",
  tags,
  onAddTag,
  onAddAll,
}: TagSuggestionsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-4 border border-border bg-secondary/25 px-3 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        {onAddAll && (
          <button
            type="button"
            onClick={onAddAll}
            className="text-[10px] uppercase tracking-[0.18em] text-foreground transition-colors hover:text-signal-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Add all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onAddTag(tag)}
            className="border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
