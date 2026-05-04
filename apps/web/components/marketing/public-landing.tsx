"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CloudSun,
  Layers3,
  Sparkles,
} from "lucide-react";
import { EditorialBackdrop } from "@/components/marketing/editorial-backdrop";
import { ShowcaseBackdrop } from "@/components/marketing/showcase-backdrop";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import {
  marketingContainerVariants,
  marketingItemVariants,
  usePrefersReducedMarketingMotion,
} from "@/components/marketing/landing-reveal";

const HERO_IMAGE = "/marketing/outfai-editorial-hero.jpg";

const productCards = [
  {
    title: "Scan your closet",
    copy: "Capture what you own so your stylist starts from real pieces, not generic trends.",
    icon: Camera,
  },
  {
    title: "Read your day",
    copy: "Weather, calendar, color, comfort, and mood shape every recommendation.",
    icon: CloudSun,
  },
  {
    title: "Build the look",
    copy: "Get a complete outfit with the reasoning, then swap pieces until it feels right.",
    icon: Sparkles,
  },
];

const outfitPieces = [
  "Cream knit jacket",
  "Wide-leg black trouser",
  "Soft blue overshirt",
  "Low-profile sneaker",
];

const steps = [
  "Add garments from photos",
  "Set the occasion",
  "Review the outfit logic",
  "Save or schedule the look",
];

export function PublicLanding() {
  const reduceMotion = usePrefersReducedMarketingMotion();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground dark:bg-[var(--marketing-void)] dark:text-[#f4f3ef]">
      <div className="dark:hidden">
        <EditorialBackdrop />
      </div>
      <div className="hidden dark:block">
        <ShowcaseBackdrop />
      </div>

      <div
        aria-hidden
        className="glass-veil pointer-events-none absolute inset-0 z-[1]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[min(96rem,96vw)] px-3 py-2 sm:px-5 sm:py-3 md:px-8">
        <MarketingHeader
          variant="landing"
          dense
          showThemeToggle
          className="glass-bar -mx-3 rounded-[var(--marketing-radius-apple)] border-black/[0.06] px-3 py-2 dark:border-white/10 sm:-mx-5 sm:px-5 md:-mx-8 md:px-8"
        />

        <motion.section
          className="relative isolate min-h-[calc(100dvh-5.5rem)] overflow-hidden rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 bg-[#0a0a0a] p-4 text-[#f4f3ef] shadow-[var(--marketing-shadow-elevated)] dark:border-[#f4f3ef]/12 sm:p-6 lg:p-8"
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? false : "show"}
          variants={marketingContainerVariants}
          aria-labelledby="landing-heading"
        >
          <Image
            src={HERO_IMAGE}
            alt="Sunlit boutique clothing racks"
            fill
            priority
            className="-z-20 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,10,0.82)_0%,rgba(10,10,10,0.56)_38%,rgba(10,10,10,0.18)_68%,rgba(10,10,10,0.62)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-[#0a0a0a]/78 via-[#0a0a0a]/22 to-transparent" />

          <motion.div
            variants={marketingItemVariants}
            className="grid min-h-[calc(100dvh-9.5rem)] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(19rem,0.62fr)] lg:items-end"
          >
            <div className="flex max-w-4xl flex-col justify-center self-center lg:self-end">
              <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#c6a564] sm:text-[11px]">
                Personal AI stylist
              </p>
              <h1
                id="landing-heading"
                className="mt-4 max-w-[10ch] text-balance font-serif text-[clamp(4.2rem,11vw,11.5rem)] font-normal italic leading-[0.76] tracking-normal text-[#f4f3ef]"
              >
                Know what to wear
              </h1>
              <p className="mt-6 max-w-[43rem] text-pretty font-sans text-base leading-relaxed text-[#f1ede6] sm:text-lg">
                OutfAI turns your actual wardrobe into a personal styling
                system: upload your pieces, tell it your day, and get outfits
                that feel intentional without feeling overthought.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--marketing-radius-apple)] bg-[#f4f3ef] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f3ef] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:text-xs"
                >
                  Create your stylist
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--marketing-radius-apple)] border border-[#f4f3ef]/24 bg-[#0a0a0a]/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f4f3ef] backdrop-blur-md transition-colors hover:border-[#f4f3ef]/45 hover:bg-[#f4f3ef]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f3ef] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:text-xs"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-3">
                {["Closet-aware", "Weather-aware", "Taste-aware"].map(
                  (label) => (
                    <div
                      key={label}
                      className="rounded-[var(--marketing-radius-apple)] border border-[#f4f3ef]/18 bg-[#0a0a0a]/35 px-4 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-[#f4f3ef] backdrop-blur-md"
                    >
                      {label}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="grid gap-3 self-end">
              <div className="rounded-[var(--marketing-radius-apple)] border border-[#f4f3ef]/18 bg-[#0a0a0a]/58 p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#c6a564]">
                  The brief
                </p>
                <p className="mt-2 max-w-[28rem] font-serif text-2xl italic leading-tight text-[#f4f3ef]">
                  Monday meeting. Rain later. Wants polish without stiffness.
                </p>
              </div>

              <div className="rounded-[var(--marketing-radius-apple)] border border-[#f4f3ef]/18 bg-[#0a0a0a]/58 p-4 text-[#f4f3ef] shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#c6a564]">
                      Generated look
                    </p>
                    <p className="mt-2 font-serif text-3xl italic leading-none">
                      Easy structure
                    </p>
                  </div>
                  <Sparkles
                    className="h-5 w-5 text-[#ff4d00] dark:text-[#c6a564]"
                    aria-hidden
                  />
                </div>
                <p className="mt-4 text-pretty font-sans text-sm leading-relaxed text-[#ebe4d7]">
                  A practical outfit that uses soft contrast, keeps the palette
                  grounded, and still feels put together when the day changes.
                </p>
                <div className="mt-5 grid gap-2">
                  {outfitPieces.map((piece) => (
                    <div
                      key={piece}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[var(--marketing-radius-apple)] border border-[#f4f3ef]/12 bg-[#f4f3ef]/8 px-3 py-2"
                    >
                      <Layers3 className="h-4 w-4 text-[#c6a564]" aria-hidden />
                      <span className="truncate font-sans text-xs uppercase tracking-[0.15em]">
                        {piece}
                      </span>
                      <Check className="h-4 w-4 opacity-45" aria-hidden />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--marketing-radius-apple)] border border-[#f4f3ef]/18 bg-[#0a0a0a]/58 p-4 text-[#f4f3ef] backdrop-blur-xl">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#c6a564]">
                  Why it works
                </p>
                <p className="mt-3 text-pretty font-sans text-sm leading-relaxed text-[#ebe4d7]">
                  OutfAI explains the silhouette, color balance, weather fit,
                  and which closet pieces are doing the work.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <section className="grid gap-4 border-t border-[#0a0a0a]/10 py-12 dark:border-[#f4f3ef]/12 lg:grid-cols-[0.72fr_1.28fr] lg:py-16">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#6a6258] dark:text-[#b7ada0]">
              The product
            </p>
            <h2 className="mt-4 max-w-[11ch] font-serif text-[clamp(3rem,7vw,7rem)] italic leading-[0.82] tracking-normal">
              A stylist with memory.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {productCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="min-h-[17rem] rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 bg-[#f5f5f7]/68 p-5 dark:border-[#f4f3ef]/12 dark:bg-[#111111]/68"
                >
                  <Icon
                    className="h-5 w-5 text-[#ff4d00] dark:text-[#c6a564]"
                    aria-hidden
                  />
                  <h3 className="mt-8 font-serif text-2xl italic leading-none">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-pretty font-sans text-sm leading-relaxed text-[#3f3932] dark:text-[#d8d1c4]">
                    {card.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 border-t border-[#0a0a0a]/10 py-12 dark:border-[#f4f3ef]/12 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-16">
          <div className="rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 bg-[#f5f5f7]/68 p-4 dark:border-[#f4f3ef]/12 dark:bg-[#111111]/68">
            <div className="rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 bg-white p-3 dark:border-[#f4f3ef]/10 dark:bg-[#0a0a0a]/35">
              <div className="flex items-center justify-between border-b border-[#0a0a0a]/10 pb-3 dark:border-[#f4f3ef]/10">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#6a6258] dark:text-[#b7ada0]">
                    Today
                  </p>
                  <p className="mt-1 font-serif text-2xl italic">
                    Client lunch
                  </p>
                </div>
                <CalendarDays
                  className="h-5 w-5 text-[#ff4d00] dark:text-[#c6a564]"
                  aria-hidden
                />
              </div>
              <div className="grid gap-3 pt-3 sm:grid-cols-2">
                {[
                  ["Weather", "54F, light rain"],
                  ["Mood", "Quiet confidence"],
                  ["Constraint", "Comfortable commute"],
                  ["Output", "Layered neutral look"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 px-3 py-3 dark:border-[#f4f3ef]/10"
                  >
                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6a6258] dark:text-[#b7ada0]">
                      {label}
                    </p>
                    <p className="mt-2 font-sans text-sm text-[#0a0a0a] dark:text-[#f4f3ef]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#6a6258] dark:text-[#b7ada0]">
              Personal, not generic
            </p>
            <h2 className="mt-4 max-w-[12ch] font-serif text-[clamp(3rem,7vw,7rem)] italic leading-[0.82] tracking-normal">
              Dress from signal, not panic.
            </h2>
            <p className="mt-6 max-w-[38rem] text-pretty font-sans text-base leading-relaxed text-[#3f3932] dark:text-[#d8d1c4]">
              The best recommendation is not the loudest one. It is the one that
              understands what you own, what your day asks for, and how you
              actually like to feel in your clothes.
            </p>
          </div>
        </section>

        <section className="border-t border-[#0a0a0a]/10 py-12 dark:border-[#f4f3ef]/12 lg:py-16">
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#6a6258] dark:text-[#b7ada0]">
                How it works
              </p>
              <h2 className="mt-4 max-w-[10ch] font-serif text-[clamp(3rem,7vw,7rem)] italic leading-[0.82] tracking-normal">
                Four small moves.
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {steps.map((step, index) => (
                <article
                  key={step}
                  className="rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 bg-[#f5f5f7]/68 p-5 dark:border-[#f4f3ef]/12 dark:bg-[#111111]/68"
                >
                  <p className="font-serif text-4xl italic text-[#ff4d00] dark:text-[#c6a564]">
                    {index + 1}
                  </p>
                  <h3 className="mt-8 font-serif text-2xl italic leading-none">
                    {step}
                  </h3>
                  <div className="mt-8 h-px bg-[#0a0a0a]/10 dark:bg-[#f4f3ef]/12" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/10 bg-[#f5f5f7]/72 p-5 dark:border-[#f4f3ef]/12 dark:bg-[#111111]/72 sm:p-8 lg:p-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#6a6258] dark:text-[#b7ada0]">
            Start with your closet
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <h2 className="max-w-[13ch] font-serif text-[clamp(3.2rem,8vw,8rem)] italic leading-[0.8] tracking-normal">
              Your next outfit is already there.
            </h2>
            <Link
              href="/signup"
              className="inline-flex min-h-[50px] w-fit items-center justify-center gap-2 rounded-[var(--marketing-radius-apple)] bg-[#0a0a0a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f4f3ef] transition-colors hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-[#f4f3ef] dark:text-[#0a0a0a] dark:hover:bg-[#e8e6e0] dark:focus-visible:ring-offset-[var(--marketing-void)] sm:text-xs"
            >
              Build your stylist
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
