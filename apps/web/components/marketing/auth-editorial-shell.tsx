import type { ReactNode } from "react";
import Image from "next/image";
import { MarketingHeader } from "@/components/marketing/marketing-header";

const AUTH_IMAGE = "/marketing/outfai-editorial-hero.jpg";

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
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src={AUTH_IMAGE}
          alt=""
          fill
          priority={false}
          className="object-cover opacity-32 dark:opacity-24"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,243,239,0.96)_0%,rgba(244,243,239,0.82)_46%,rgba(244,243,239,0.68)_100%)] dark:bg-[linear-gradient(90deg,rgba(10,10,10,0.96)_0%,rgba(10,10,10,0.86)_46%,rgba(10,10,10,0.72)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[min(96vw,90rem)] flex-col px-3 py-2 sm:px-5 sm:py-3 md:px-8">
        <MarketingHeader
          variant="auth"
          dense
          showThemeToggle
          className="glass-bar rounded-[var(--marketing-radius-apple)] border-black/[0.06] px-3 py-2 dark:border-white/10 sm:px-5 md:px-6"
        />

        <div className="grid flex-1 grid-cols-1 content-center gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-8 lg:gap-y-4 xl:gap-10 [@media(max-height:720px)]:gap-3">
          <div className="min-w-0 rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 bg-[#f5f5f7]/68 p-5 backdrop-blur-md dark:border-[#f4f3ef]/12 dark:bg-[#111111]/68 sm:p-6 lg:max-w-[42rem] lg:pr-8">
            {aside}
          </div>

          <div className="flex min-w-0 flex-col justify-center lg:max-h-full">
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
