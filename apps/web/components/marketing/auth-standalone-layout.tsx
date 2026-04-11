import Link from "next/link";

const brandLinkClass =
  "text-sm font-medium uppercase tracking-[0.34em] text-foreground transition-colors hover:text-[var(--signal-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";

/**
 * Theme-aware shell for standalone auth flows (forgot/reset) — matches verify-email
 * blobs + gradient, works in light and dark.
 */
export function AuthStandaloneLayout({
  children,
  maxWidthClass = "max-w-xl",
}: {
  children: React.ReactNode;
  /** Tailwind max-width on the content column */
  maxWidthClass?: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-foreground/6 blur-3xl" />
        <div className="absolute top-40 -right-28 h-96 w-96 rounded-full bg-foreground/4 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>
      <div
        aria-hidden
        className="glass-veil pointer-events-none absolute inset-0 z-[1]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[min(96vw,80rem)] flex-col px-4 py-4 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-4 flex shrink-0 items-center justify-between sm:mb-5">
          <Link href="/" className={brandLinkClass}>
            OutfAI
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center pb-8">
          <div className={`w-full ${maxWidthClass}`}>{children}</div>
        </div>
      </div>
    </main>
  );
}

export const authStandaloneCardClass =
  "glass-panel rounded-2xl border-border/70 p-6 sm:p-8";

export const authStandaloneFieldClass =
  "rounded-lg border border-border bg-muted/40 transition-[box-shadow,border-color] focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/25 dark:bg-muted/20";

export const authStandaloneLabelClass =
  "block px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]";

export const authStandalonePrimaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
