import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative smartphone frame for marketing previews (not a real device shell).
 */
export function PhoneMockFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative mx-auto flex min-h-0 w-full max-w-[min(100%,400px)] flex-col overflow-hidden px-1 sm:max-w-[min(100%,420px)] lg:max-w-[min(100%,440px)]",
        className
      )}
      aria-label="Product preview in a phone frame"
    >
      {/* Ambient + contact shadow (stacked for depth) */}
      <div
        className="pointer-events-none absolute inset-x-[8%] -bottom-6 top-[18%] rounded-[3.25rem] bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,0,0,0.28),transparent_62%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,0,0,0.55),transparent_65%)]"
        aria-hidden
      />

      <div className="relative flex min-h-0 max-h-full flex-1 flex-col">
        {/* Side hardware (decorative) — typical mute + volume left, power right */}
        <div
          className="pointer-events-none absolute left-[2px] top-[20%] z-0 h-9 w-[3px] rounded-l-sm bg-gradient-to-r from-[#1f1f1f] to-[#3a3a3a] shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)] sm:left-[3px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[2px] top-[28%] z-0 h-14 w-[3px] rounded-l-sm bg-gradient-to-r from-[#1f1f1f] to-[#3a3a3a] shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)] sm:left-[3px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[2px] top-[40%] z-0 h-14 w-[3px] rounded-l-sm bg-gradient-to-r from-[#1f1f1f] to-[#3a3a3a] shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)] sm:left-[3px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-[2px] top-[24%] z-0 h-20 w-[3px] rounded-r-sm bg-gradient-to-l from-[#1f1f1f] to-[#3a3a3a] shadow-[inset_1px_0_0_rgba(255,255,255,0.06)] sm:right-[3px]"
          aria-hidden
        />

        {/* Outer chassis: brushed metal + chamfered edge */}
        <div
          className={cn(
            "relative flex min-h-0 max-h-full flex-1 flex-col rounded-[3rem] bg-gradient-to-b from-[#4a4a4a] via-[#2e2e2e] to-[#161616] p-[12px] shadow-[0_2px_0_rgba(255,255,255,0.06)_inset,0_-1px_0_rgba(0,0,0,0.45)_inset,0_48px_96px_-32px_rgba(0,0,0,0.55),0_16px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/50",
            "dark:from-[#555] dark:via-[#353535] dark:to-[#1a1a1a] dark:shadow-[0_2px_0_rgba(255,255,255,0.05)_inset,0_48px_96px_-28px_rgba(0,0,0,0.65)]"
          )}
        >
          {/* Inner bezel lip */}
          <div className="flex min-h-0 max-h-full flex-1 flex-col rounded-[2.4rem] bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-[2px] shadow-[0_1px_0_rgba(255,255,255,0.04)]">
            <div className="relative flex min-h-0 max-h-full flex-1 flex-col overflow-hidden rounded-[2.25rem] bg-[#010101] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
              {/* Glass reflection (subtle) */}
              <div
                className="pointer-events-none absolute inset-0 z-20 rounded-[2.25rem] bg-[linear-gradient(165deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.02)_22%,transparent_48%)]"
                aria-hidden
              />
              {/* OLED inner border */}
              <div
                className="pointer-events-none absolute inset-[1px] z-10 rounded-[2.2rem] ring-1 ring-black/60"
                aria-hidden
              />

              {/* Status + island */}
              <div className="relative z-30 shrink-0 bg-[var(--marketing-canvas-apple)] px-5 pb-2 pt-3 dark:bg-[#0a0a0a] sm:px-6 sm:pt-3.5">
                <div className="flex items-center justify-between font-sans text-[12px] font-semibold tabular-nums leading-none tracking-tight text-[#0a0a0a] dark:text-[#f4f3ef] sm:text-[13px]">
                  <span>9:41</span>
                  <div
                    className="flex items-center gap-1.5 opacity-95"
                    aria-hidden
                  >
                    <svg
                      width="19"
                      height="12"
                      viewBox="0 0 17 11"
                      fill="currentColor"
                      className="shrink-0"
                    >
                      <path d="M1 7h2v3H1V7zm4-2h2v5H5V5zm4-3h2v8H9V2zm4-2h2v10h-2V0z" />
                    </svg>
                    <svg
                      width="17"
                      height="12"
                      viewBox="0 0 15 11"
                      fill="none"
                      className="shrink-0"
                    >
                      <rect
                        x="0.5"
                        y="2"
                        width="11"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <path
                        d="M13 4v3"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center pb-1 pt-1.5">
                  <div
                    className="h-[31px] w-[min(38%,132px)] min-w-[104px] rounded-full bg-[#0a0a0a] shadow-[inset_0_1px_2px_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.85)] dark:bg-[#141414]"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="relative z-30 flex min-h-0 flex-1 flex-col">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
