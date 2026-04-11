import type { ReactNode } from "react";

/** Theme-aware input — use on login/signup fields. */
export const authInputClassName =
  "w-full bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground";

/** Show/hide password control — matches field stack surface in light and dark. */
export const authPasswordToggleClassName =
  "absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-sm border border-[#0a0a0a]/12 bg-white text-muted-foreground transition-colors duration-150 hover:bg-[#f4f3ef] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] dark:border-[#f4f3ef]/15 dark:bg-[#111111] dark:hover:bg-[#1a1a1a] dark:hover:text-[#f4f3ef]";

/**
 * Sharp-edged panel for auth forms — editorial surface, light and dark.
 */
export function FormPanel({
  eyebrow,
  title,
  description,
  icon,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  /** Tighter padding for single-viewport auth layouts. */
  compact?: boolean;
}) {
  const pad = compact
    ? "px-4 py-3 sm:px-5 sm:py-4"
    : "px-5 py-5 sm:px-6 sm:py-6";
  const headPad = compact
    ? "px-4 py-3 sm:px-5 sm:py-3.5"
    : "px-5 py-5 sm:px-6 sm:py-6";
  return (
    <div className="relative max-h-full min-h-0 overflow-hidden rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/[0.14] bg-[#faf9f7] shadow-[0_28px_80px_-44px_rgba(10,10,10,0.38)] dark:border-[#f4f3ef]/[0.12] dark:bg-card dark:shadow-[0_28px_80px_-44px_rgba(0,0,0,0.65)]">
      <div
        className={`flex items-start justify-between gap-3 border-b border-[#0a0a0a]/[0.08] dark:border-[#f4f3ef]/[0.1] ${headPad}`}
      >
        <div className="min-w-0">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
            {eyebrow}
          </p>
          <h2
            className={`font-sans font-medium tracking-tight text-foreground ${
              compact ? "mt-1 text-base sm:text-lg" : "mt-2 text-lg sm:text-xl"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-0.5 max-w-md font-sans leading-snug text-muted-foreground ${
              compact ? "text-xs sm:text-sm" : "text-sm leading-relaxed"
            }`}
          >
            {description}
          </p>
        </div>
        {icon ? (
          <div
            className={`hidden shrink-0 items-center justify-center border border-[#0a0a0a]/[0.1] text-muted-foreground dark:border-[#f4f3ef]/[0.12] dark:text-[#a8a8a4] sm:flex ${
              compact ? "h-9 w-9" : "h-11 w-11"
            }`}
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div className={pad}>{children}</div>
    </div>
  );
}

/** Grouped inputs with divide-y — label above each field. */
export function FormFieldStack({ children }: { children: ReactNode }) {
  return (
    <div className="border border-[#0a0a0a]/[0.12] bg-white dark:border-[#f4f3ef]/[0.12] dark:bg-[#0a0a0a]">
      {children}
    </div>
  );
}

export function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-b border-[#0a0a0a]/[0.08] last:border-b-0 dark:border-[#f4f3ef]/[0.1] ${className}`}
    >
      <label className="block px-4 pt-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:pt-3 sm:text-[11px]">
        {label}
      </label>
      <div className="px-4 pb-2.5 sm:pb-3">{children}</div>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div className="mt-3 border border-[#ff4d00]/35 bg-[#ff4d00]/[0.08] px-3 py-2 sm:mt-4 dark:border-[#ff6a2e]/45 dark:bg-[#ff4d00]/[0.14]">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#c43b00] dark:text-[#ffb090]">
        {message}
      </p>
    </div>
  );
}

export function PrimaryFormButton({
  children,
  disabled,
  type = "submit",
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="group relative flex w-full min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-[var(--marketing-radius-apple)] bg-[#0a0a0a] px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#f4f3ef] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 active:scale-[0.98] dark:bg-[#f4f3ef] dark:text-[#0a0a0a] dark:hover:bg-[#e8e6e0] sm:px-5 sm:py-3.5 sm:tracking-[0.22em]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      />
      <span className="relative inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
