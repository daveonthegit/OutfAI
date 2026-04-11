"use client";

import { cn } from "@/lib/utils";

export interface FilterBarChipOption {
  value: string;
  label: string;
}

export interface FilterBarSortOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  /** Search input (optional) */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    "aria-label"?: string;
  };
  /** Sort dropdown (optional) */
  sort?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterBarSortOption[];
    "aria-label"?: string;
  };
  /** Filter chips (optional). Use value "all" or similar for "all" option. */
  chips?: {
    options: FilterBarChipOption[];
    value: string;
    onChange: (value: string) => void;
    allLabel?: string;
  };
  /** Show "Clear all" and call this when clicked. When true, show the button (e.g. parent passes filtersActive). */
  onClearAll?: () => void;
  showClearAll?: boolean;
  clearAllLabel?: string;
  /** e.g. "Showing 3 of 10 looks" */
  resultSummary?: string;
  className?: string;
  /** Extra node (e.g. "Select" button) on the right of the first row */
  children?: React.ReactNode;
}

const defaultClearLabel = "Clear all filters";

/**
 * Shared filter bar: optional search, sort, chips, clear all, and result summary.
 * Use on Closet (search + category chips) and Archive (search + sort + mood chips + clear all).
 */
export function FilterBar({
  search,
  sort,
  chips,
  onClearAll,
  showClearAll = false,
  clearAllLabel = defaultClearLabel,
  resultSummary,
  className,
  children,
}: FilterBarProps) {
  const showClear =
    onClearAll && (showClearAll || (resultSummary && resultSummary.length > 0));

  return (
    <section
      className={cn(
        "mb-8 flex flex-col gap-4 rounded-sm glass-panel p-4 sm:p-5",
        className
      )}
      aria-label="Filters"
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
          {search && (
            <div className="relative flex-1 min-w-0 sm:max-w-[280px]">
              <input
                type="search"
                placeholder={search.placeholder}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="w-full bg-[var(--glass-panel)] backdrop-blur-sm border border-[var(--glass-border-strong)] px-3 py-2 pl-9 text-[11px] uppercase tracking-[0.12em] text-foreground placeholder:text-muted-foreground outline-none focus:border-signal-orange/60 focus-visible:ring-2 focus-visible:ring-signal-orange/50 focus-visible:ring-offset-0"
                aria-label={search["aria-label"] ?? "Search"}
              />
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                aria-hidden
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              {search.value && (
                <button
                  type="button"
                  onClick={() => search.onChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
                  aria-label="Clear search"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {sort && (
            <select
              value={sort.value}
              onChange={(e) => sort.onChange(e.target.value)}
              className="w-full sm:w-auto bg-[var(--glass-panel)] backdrop-blur-sm border border-[var(--glass-border-strong)] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-foreground outline-none focus:border-signal-orange/60 focus-visible:ring-2 focus-visible:ring-signal-orange/50 focus-visible:ring-offset-0"
              aria-label={sort["aria-label"] ?? "Sort order"}
            >
              {sort.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
        {children}
      </div>

      {chips && chips.options.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => chips.onChange("all")}
            className={cn(
              "px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors duration-100",
              chips.value === "all"
                ? "border-signal-orange text-signal-orange bg-signal-orange/10"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            )}
          >
            {chips.allLabel ?? "All"}
          </button>
          {chips.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => chips.onChange(opt.value)}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors duration-100",
                chips.value.toLowerCase() === opt.value.toLowerCase()
                  ? "border-signal-orange text-signal-orange bg-signal-orange/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {resultSummary && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {resultSummary}
          </p>
        )}
        {showClear && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {clearAllLabel}
          </button>
        )}
      </div>
    </section>
  );
}
