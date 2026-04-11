import type { ReactNode } from "react";
import { EditorialBackdrop } from "@/components/marketing/editorial-backdrop";
import { ShowcaseBackdrop } from "@/components/marketing/showcase-backdrop";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export function AuthEditorialShell({
  children,
  aside,
  footerNote,
}: {
  aside: ReactNode;
  children: ReactNode;
  footerNote?: string;
}) {
  return (
    <main className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="dark:hidden">
        <EditorialBackdrop />
      </div>
      <div className="hidden dark:block">
        <ShowcaseBackdrop />
      </div>

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[min(96vw,90rem)] flex-col px-3 py-2 sm:px-5 sm:py-3 md:px-8">
        <MarketingHeader variant="auth" dense showThemeToggle />

        <div className="grid min-h-0 flex-1 grid-cols-1 content-center gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:gap-y-4 xl:gap-10 [@media(max-height:720px)]:gap-3">
          <div className="min-h-0 min-w-0 overflow-hidden lg:max-w-[42rem] lg:pr-2">
            {aside}
          </div>

          <div className="flex min-h-0 min-w-0 flex-col justify-center overflow-hidden lg:max-h-full">
            {children}
          </div>
        </div>

        {footerNote ? (
          <p className="shrink-0 pt-2 font-sans text-[9px] uppercase leading-snug tracking-[0.18em] text-muted-foreground sm:text-[10px]">
            {footerNote}
          </p>
        ) : null}
      </div>
    </main>
  );
}
