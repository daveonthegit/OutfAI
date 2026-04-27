"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EditorialBackdrop } from "@/components/marketing/editorial-backdrop";
import { ShowcaseBackdrop } from "@/components/marketing/showcase-backdrop";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { PhoneMockFrame } from "@/components/marketing/phone-mock-frame";
import {
  marketingContainerVariants,
  marketingItemVariants,
  usePrefersReducedMarketingMotion,
} from "@/components/marketing/landing-reveal";
import { usePrefersReducedMotionMedia } from "@/components/marketing/use-prefers-reduced-motion";

/** Only files that exist in /public — add outfit-1/2 when assets are available. */
const GALLERY_IMAGES: { src: string; alt: string }[] = [
  {
    src: "/outfit-3.jpg",
    alt: "Minimalist neutral outfit with clean lines",
  },
  {
    src: "/outfit-4.jpg",
    alt: "Smart casual layered look with jacket and sneakers",
  },
  {
    src: "/outfit-5.jpg",
    alt: "Relaxed weekend style with comfortable layers",
  },
];

const HOW_IT_WORKS = [
  {
    k: "01",
    title: "Upload your wardrobe",
    text: "Start with a few favorite pieces or build your closet over time.",
  },
  {
    k: "02",
    title: "Let OutfAI organize it",
    text: "Your pieces become easier to browse, plan, and reuse with intention.",
  },
  {
    k: "03",
    title: "Build sharper outfits",
    text: "Create polished combinations from clothes you already own.",
  },
] as const;

const BENEFIT_CARDS = [
  {
    k: "Decide faster",
    d: "Cut the morning guesswork and move from closet to outfit with less friction.",
  },
  {
    k: "Wear more of what you own",
    d: "Rediscover pieces that already fit your style instead of defaulting to the same few looks.",
  },
  {
    k: "Repeat with intention",
    d: "Save combinations that work, refine them, and bring them back when the moment fits.",
  },
  {
    k: "Shop less randomly",
    d: "See what your wardrobe is missing before adding more noise to your closet.",
  },
] as const;

const PREVIEW_CARDS = [
  {
    label: "Digital closet",
    title: "Every piece, easier to see.",
    rows: ["Outerwear", "Tops", "Bottoms", "Shoes", "Accessories"],
  },
  {
    label: "Outfit builder",
    title: "Pair what works together.",
    rows: [
      "Neutral blazer",
      "Ribbed tank",
      "Tailored trouser",
      "Leather slingback",
    ],
  },
  {
    label: "Saved looks",
    title: "Keep your best outfits close.",
    rows: ["Work polish", "Dinner edit", "Travel capsule", "Weekend clean"],
  },
] as const;

const USE_CASES = [
  "Busy mornings",
  "Work outfits",
  "Travel packing",
  "Capsule wardrobes",
  "Event styling",
  "Everyday repeats",
] as const;

const FAQ_ITEMS = [
  {
    q: "Do I need to upload my whole closet?",
    a: "No. You can begin with a few pieces and add more whenever you want your digital closet to feel more complete.",
  },
  {
    q: "Does OutfAI only suggest new clothes to buy?",
    a: "No. OutfAI is centered on helping you style what you already own first, so your existing wardrobe becomes more useful.",
  },
  {
    q: "Can I save outfits?",
    a: "Yes. Saved looks help you repeat, refine, and plan outfits without rebuilding the same idea every time.",
  },
  {
    q: "Is this for a specific style?",
    a: "OutfAI is designed around your wardrobe, so the experience can adapt to polished, casual, minimal, expressive, or capsule-based closets.",
  },
  {
    q: "How long does setup take?",
    a: "You can start in minutes by adding a few wardrobe pieces, then continue building your closet as you go.",
  },
] as const;

const SLIDE_MS = 4000;

export function PublicLanding() {
  const [activeImage, setActiveImage] = useState(0);
  const [pauseHover, setPauseHover] = useState(false);
  const reduceMotion = usePrefersReducedMarketingMotion();
  const prefersReducedMotion = usePrefersReducedMotionMedia();

  const advance = useCallback(() => {
    setActiveImage((c) => (c + 1) % GALLERY_IMAGES.length);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || GALLERY_IMAGES.length <= 1) return;
    if (pauseHover) return;
    const id = window.setInterval(advance, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [advance, prefersReducedMotion, pauseHover]);

  const goTo = (index: number) => {
    setActiveImage(index);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground dark:bg-[var(--marketing-void)] dark:text-[#f4f3ef]">
      <div className="dark:hidden">
        <EditorialBackdrop />
      </div>
      <div className="hidden dark:block">
        <ShowcaseBackdrop />
      </div>

      {/* Frosted veil: editorial (light) + noir (dark) — blurs grid/orbs beneath */}
      <div
        aria-hidden
        className="glass-veil pointer-events-none absolute inset-0 z-[1]"
      />

      <section className="relative z-10 mx-auto flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-[min(96vw,90rem)] flex-col overflow-hidden px-3 py-2 sm:px-5 sm:py-3 md:px-8">
        <MarketingHeader
          variant="landing"
          dense
          showThemeToggle
          className="glass-bar -mx-3 rounded-sm border-black/[0.06] px-3 py-2 dark:border-white/10 sm:-mx-5 sm:px-5 md:-mx-8 md:px-8"
        />

        <motion.div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-center lg:gap-6 lg:overflow-visible xl:gap-10 [@media(max-height:700px)]:gap-2"
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? false : "show"}
          variants={marketingContainerVariants}
        >
          <motion.div
            variants={marketingItemVariants}
            className="flex min-h-0 shrink-0 flex-col justify-center overflow-x-hidden overflow-y-auto max-sm:max-h-[min(52vh,440px)] sm:max-h-none sm:overflow-visible lg:min-h-0 lg:justify-center lg:py-1 [@media(max-height:700px)]:shrink"
          >
            <p className="mb-1 font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
              Your wardrobe, refined by AI
            </p>

            <h1 className="font-serif text-[clamp(1.45rem,3.2vw+0.65rem,2.85rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#f4f3ef] sm:leading-[1.07] [@media(max-height:700px)]:text-[clamp(1.25rem,2.6vw,2.1rem)]">
              <span className="italic text-[#ff4d00] dark:text-[#f4f3ef]">
                Dress
              </span>
              <span> with clarity.</span>
            </h1>

            <p className="mt-2 max-w-[min(42ch,100%)] text-pretty font-sans text-sm leading-relaxed text-[var(--marketing-ink-bmw)] opacity-95 dark:text-[#b8b6b0] dark:opacity-100 max-sm:line-clamp-4 sm:line-clamp-none lg:max-w-[min(48ch,100%)] [@media(max-height:700px)]:mt-1 [@media(max-height:700px)]:text-xs">
              OutfAI helps you organize your closet and build polished
              outfits—so you can step out with intention, not noise.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3 [@media(max-height:700px)]:mt-2">
              <Link
                href="/signup"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-[var(--marketing-radius-apple)] bg-[#0a0a0a] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f4f3ef] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-[#f4f3ef] dark:text-[#0a0a0a] dark:hover:bg-[#e8e6e0] dark:focus-visible:ring-offset-[var(--marketing-void)] sm:px-5 sm:text-xs [@media(max-height:700px)]:py-2"
              >
                Create account
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/18 bg-transparent px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors duration-150 hover:border-[#0a0a0a]/35 hover:bg-[#0a0a0a]/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-[#f4f3ef]/25 dark:text-[#f4f3ef] dark:hover:border-[#f4f3ef]/45 dark:hover:bg-[#f4f3ef]/[0.06] dark:focus-visible:ring-offset-[var(--marketing-void)] sm:px-5 sm:text-xs [@media(max-height:700px)]:py-2"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-3 hidden font-sans text-[11px] tabular-nums leading-snug text-[#7a7a7a] sm:mt-4 sm:block [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:text-[10px]">
              <span className="text-[#ff4d00] dark:text-[#c6a564]">~4 min</span>{" "}
              to first outfit ·{" "}
              <span className="text-[#0a0a0a] dark:text-[#f4f3ef]">128+</span>{" "}
              looks indexed (beta)
            </p>
          </motion.div>

          <motion.div
            variants={marketingItemVariants}
            className="flex min-h-0 w-full flex-1 flex-col items-center justify-center lg:max-h-[min(88dvh,780px)] lg:min-h-0"
          >
            <PhoneMockFrame className="max-h-[min(82dvh,720px)] w-full lg:max-h-full">
              <div
                className="relative flex min-h-0 w-full flex-col overflow-hidden border-x border-b border-[#0a0a0a]/12 bg-[var(--marketing-canvas-apple)] dark:border-[#f4f3ef]/10 dark:bg-[#111111]"
                onMouseEnter={() => setPauseHover(true)}
                onMouseLeave={() => setPauseHover(false)}
              >
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#0a0a0a]/[0.08] px-4 py-2.5 dark:border-[#f4f3ef]/10 sm:px-5 sm:py-3">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[10px] uppercase tracking-[0.2em] text-[#7a7a7a] dark:text-[#8a8a86] sm:text-[11px]">
                      Featured looks
                    </p>
                    <p className="truncate font-serif text-[1.05rem] italic leading-snug text-[#0a0a0a] dark:text-[#f4f3ef] sm:text-lg">
                      A calmer way to plan what you wear.
                    </p>
                  </div>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#0a0a0a]/10 dark:border-[#f4f3ef]/12"
                    aria-hidden
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-[#5a5a5a] dark:text-[#8a8a86]"
                    >
                      <path d="M6 7h12M6 12h8M6 17h10" />
                    </svg>
                  </div>
                </div>

                <div className="relative aspect-[10/13] w-full shrink-0 border-b border-[#0a0a0a]/[0.08] dark:border-[#f4f3ef]/10 min-h-[12rem] sm:min-h-[14rem]">
                  <div className="absolute inset-0">
                    {GALLERY_IMAGES.map((item, index) => (
                      <div
                        key={item.src}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                          activeImage === index ? "opacity-100" : "opacity-0"
                        }`}
                        aria-hidden={activeImage !== index}
                      >
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          priority={index === 0}
                          className="object-cover"
                          sizes="(max-width: 640px) 92vw, 420px"
                        />
                      </div>
                    ))}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/55 via-[#0a0a0a]/10 to-transparent dark:from-[#0a0a0a]/75 dark:via-[#0a0a0a]/15" />

                    <div className="pointer-events-none absolute bottom-3 left-3 max-w-[min(100%,18rem)] rounded-sm glass-panel px-3 py-2 shadow-none dark:border-[#f4f3ef]/20 sm:bottom-4 sm:left-4 sm:px-4 sm:py-3">
                      <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#ff4d00] dark:text-[#c6a564]">
                        Refined styling
                      </p>
                      <p className="mt-1 font-sans text-[11px] leading-snug text-[#3d3d3d] dark:text-[#f4f3ef]/92 sm:text-xs">
                        Build sharper outfits from pieces you already own—fewer
                        guesses, better repeats.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="flex shrink-0 items-center justify-center gap-2 py-2.5 sm:gap-2.5"
                  role="tablist"
                  aria-label="Featured looks"
                >
                  {GALLERY_IMAGES.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={activeImage === index}
                      aria-label={`Slide ${index + 1} of ${GALLERY_IMAGES.length}`}
                      className={`h-2 w-2 rounded-full transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--marketing-canvas-apple)] dark:focus-visible:ring-offset-[#111111] ${
                        activeImage === index
                          ? "bg-[#ff4d00] dark:bg-[#c6a564]"
                          : "bg-[#0a0a0a]/20 dark:bg-[#f4f3ef]/20"
                      }`}
                      onClick={() => goTo(index)}
                    />
                  ))}
                </div>

                <div className="flex shrink-0 flex-col border-t border-[#0a0a0a]/[0.08] dark:border-[#f4f3ef]/10">
                  {[
                    { k: "Plan", d: "Build outfits faster." },
                    { k: "Curate", d: "Organize your closet." },
                    { k: "Refine", d: "Repeat what works." },
                  ].map((col, i) => (
                    <div
                      key={col.k}
                      className={`min-w-0 px-3 py-2.5 sm:px-4 sm:py-3 ${
                        i > 0
                          ? "border-t border-[#0a0a0a]/[0.06] dark:border-[#f4f3ef]/[0.08]"
                          : ""
                      }`}
                    >
                      <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#7a7a7a] dark:text-[#8a8a86]">
                        {col.k}
                      </p>
                      <p className="mt-1 font-sans text-[10px] leading-snug text-[#3d3d3d] dark:text-[#d2d0ca]">
                        {col.d}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 border-t border-[#0a0a0a]/[0.08] px-3 py-2.5 text-center dark:border-[#f4f3ef]/10 sm:px-4 sm:py-3">
                  <Link
                    href="/signup"
                    className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#ff4d00] transition-colors duration-150 hover:text-[#e04600] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--marketing-canvas-apple)] dark:text-[#c6a564] dark:hover:text-[#d4b87a] dark:focus-visible:ring-offset-[#111111]"
                  >
                    Start building your wardrobe
                  </Link>
                </div>
              </div>
            </PhoneMockFrame>

            <p className="mt-2 shrink-0 font-sans text-[10px] tabular-nums text-[#7a7a7a] sm:hidden">
              <span className="text-[#ff4d00] dark:text-[#c6a564]">~4 min</span>{" "}
              first outfit ·{" "}
              <span className="text-[#0a0a0a] dark:text-[#f4f3ef]">128+</span>{" "}
              looks
            </p>
          </motion.div>
        </motion.div>
      </section>

      <MarketingExpansionSections reduceMotion={reduceMotion} />
    </main>
  );
}

function MarketingExpansionSections({
  reduceMotion,
}: {
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      className="relative z-10 mx-auto w-full max-w-[min(96vw,90rem)] px-3 pb-8 sm:px-5 sm:pb-12 md:px-8 lg:pb-16"
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.12 }}
      variants={marketingContainerVariants}
    >
      <motion.section
        variants={marketingItemVariants}
        className="border-t border-[#0a0a0a]/[0.08] py-8 dark:border-[#f4f3ef]/10 sm:py-10 lg:py-14"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-8">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
              How it works
            </p>
            <h2 className="mt-2 max-w-[12ch] font-serif text-[clamp(1.6rem,2.5vw+0.8rem,3.1rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#f4f3ef]">
              From closet noise to outfit clarity.
            </h2>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            {HOW_IT_WORKS.map((step) => (
              <article
                key={step.k}
                className="glass-panel rounded-sm border-[#0a0a0a]/[0.08] p-4 shadow-none dark:border-[#f4f3ef]/12 sm:p-5"
              >
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#ff4d00] dark:text-[#c6a564]">
                  {step.k}
                </p>
                <h3 className="mt-4 font-serif text-xl font-normal leading-tight text-[#0a0a0a] dark:text-[#f4f3ef] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 font-sans text-xs leading-relaxed text-[#5a5a5a] dark:text-[#b8b6b0] sm:text-sm">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={marketingItemVariants}
        className="border-t border-[#0a0a0a]/[0.08] py-8 dark:border-[#f4f3ef]/10 sm:py-10 lg:py-14"
      >
        <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-6 lg:flex-row lg:items-end">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
              Product preview
            </p>
            <h2 className="mt-2 max-w-[16ch] font-serif text-[clamp(1.6rem,2.5vw+0.8rem,3.1rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#f4f3ef]">
              A wardrobe system that feels quiet.
            </h2>
          </div>
          <p className="max-w-[42ch] font-sans text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b8b6b0]">
            Simple views for organizing pieces, building outfits, and returning
            to the looks that already work.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {PREVIEW_CARDS.map((card) => (
            <article
              key={card.label}
              className="overflow-hidden rounded-sm border border-[#0a0a0a]/[0.08] bg-[var(--marketing-canvas-apple)]/70 dark:border-[#f4f3ef]/10 dark:bg-[#111111]/75"
            >
              <div className="border-b border-[#0a0a0a]/[0.08] px-4 py-3 dark:border-[#f4f3ef]/10 sm:px-5">
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#ff4d00] dark:text-[#c6a564]">
                  {card.label}
                </p>
                <p className="mt-1 font-serif text-lg italic leading-snug text-[#0a0a0a] dark:text-[#f4f3ef]">
                  {card.title}
                </p>
              </div>
              <div className="grid gap-2 p-4 sm:p-5">
                {card.rows.map((row, index) => (
                  <div
                    key={row}
                    className="flex items-center justify-between gap-3 border border-[#0a0a0a]/[0.06] bg-background/40 px-3 py-2 dark:border-[#f4f3ef]/[0.08] dark:bg-[#0a0a0a]/35"
                  >
                    <span className="font-sans text-xs text-[#3d3d3d] dark:text-[#d2d0ca]">
                      {row}
                    </span>
                    <span className="font-sans text-[10px] tabular-nums text-[#7a7a7a] dark:text-[#8a8a86]">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={marketingItemVariants}
        className="border-t border-[#0a0a0a]/[0.08] py-8 dark:border-[#f4f3ef]/10 sm:py-10 lg:py-14"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 lg:items-start">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
              Why OutfAI
            </p>
            <h2 className="mt-2 max-w-[15ch] font-serif text-[clamp(1.6rem,2.5vw+0.8rem,3.1rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#f4f3ef]">
              Designed for getting dressed, not overthinking.
            </h2>
            <p className="mt-3 max-w-[46ch] font-sans text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b8b6b0]">
              OutfAI helps turn your existing wardrobe into a calmer planning
              tool, so better outfits feel easier to repeat.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            {BENEFIT_CARDS.map((item) => (
              <article
                key={item.k}
                className="glass-panel rounded-sm border-[#0a0a0a]/[0.08] p-4 shadow-none dark:border-[#f4f3ef]/12 sm:p-5"
              >
                <h3 className="font-serif text-xl font-normal leading-tight text-[#0a0a0a] dark:text-[#f4f3ef]">
                  {item.k}
                </h3>
                <p className="mt-2 font-sans text-xs leading-relaxed text-[#5a5a5a] dark:text-[#b8b6b0] sm:text-sm">
                  {item.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={marketingItemVariants}
        className="border-t border-[#0a0a0a]/[0.08] py-8 dark:border-[#f4f3ef]/10 sm:py-10 lg:py-14"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-8">
          <div className="glass-panel rounded-sm border-[#0a0a0a]/[0.08] p-5 shadow-none dark:border-[#f4f3ef]/12 sm:p-6 lg:p-8">
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
              Designed for
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {USE_CASES.map((item) => (
                <span
                  key={item}
                  className="border border-[#0a0a0a]/[0.08] bg-background/40 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-[#3d3d3d] dark:border-[#f4f3ef]/[0.1] dark:bg-[#0a0a0a]/30 dark:text-[#d2d0ca]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
              Privacy-minded
            </p>
            <h2 className="mt-2 font-serif text-[clamp(1.6rem,2.5vw+0.8rem,3.1rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#f4f3ef]">
              Your closet stays yours.
            </h2>
            <p className="mt-3 max-w-[46ch] font-sans text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b8b6b0]">
              OutfAI is built around your personal wardrobe experience. The
              clothes you add are there to help organize your closet and style
              your own looks with more clarity.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={marketingItemVariants}
        className="border-t border-[#0a0a0a]/[0.08] py-8 dark:border-[#f4f3ef]/10 sm:py-10 lg:py-14"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-8">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
              FAQ
            </p>
            <h2 className="mt-2 max-w-[12ch] font-serif text-[clamp(1.6rem,2.5vw+0.8rem,3.1rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#f4f3ef]">
              Good to know before you start.
            </h2>
          </div>

          <div className="border-y border-[#0a0a0a]/[0.08] dark:border-[#f4f3ef]/10">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group border-b border-[#0a0a0a]/[0.08] last:border-b-0 dark:border-[#f4f3ef]/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-sans text-sm text-[#0a0a0a] outline-none transition-colors duration-150 hover:text-[#ff4d00] focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] dark:text-[#f4f3ef] dark:hover:text-[#c6a564] sm:py-5 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    className="shrink-0 text-lg leading-none text-[#ff4d00] transition-transform duration-200 group-open:rotate-45 dark:text-[#c6a564]"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-[65ch] pb-4 font-sans text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b8b6b0] sm:pb-5">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={marketingItemVariants}
        className="border-t border-[#0a0a0a]/[0.08] py-8 dark:border-[#f4f3ef]/10 sm:py-10 lg:py-14"
      >
        <div className="glass-panel rounded-sm border-[#0a0a0a]/[0.08] p-5 text-center shadow-none dark:border-[#f4f3ef]/12 sm:p-8 lg:p-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#5a5a5a] dark:text-[#9a9a9a] sm:text-[11px]">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-2 max-w-[16ch] font-serif text-[clamp(1.7rem,2.8vw+0.8rem,3.3rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#f4f3ef]">
            Build your first better outfit.
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] font-sans text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b8b6b0]">
            Start with what you already own and let OutfAI help you plan with
            more intention.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-[var(--marketing-radius-apple)] bg-[#0a0a0a] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f4f3ef] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-[#f4f3ef] dark:text-[#0a0a0a] dark:hover:bg-[#e8e6e0] dark:focus-visible:ring-offset-[var(--marketing-void)] sm:px-5 sm:text-xs"
            >
              Create account
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/18 bg-transparent px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors duration-150 hover:border-[#0a0a0a]/35 hover:bg-[#0a0a0a]/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-[#f4f3ef]/25 dark:text-[#f4f3ef] dark:hover:border-[#f4f3ef]/45 dark:hover:bg-[#f4f3ef]/[0.06] dark:focus-visible:ring-offset-[var(--marketing-void)] sm:px-5 sm:text-xs"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
