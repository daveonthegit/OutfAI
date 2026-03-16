"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import AuthenticatedHome from "@/components/home/authenticated-home";

/** Gallery image paths and distinct alt text for accessibility. */
const GALLERY_IMAGES: { src: string; alt: string }[] = [
  {
    src: "/outfit-1.jpg",
    alt: "Editorial menswear look in a tailored black suit",
  },
  {
    src: "/outfit-2.jpg",
    alt: "Expressive personal style with layered textures and denim",
  },
  { src: "/outfit-3.jpg", alt: "Minimalist neutral outfit with clean lines" },
  {
    src: "/outfit-4.jpg",
    alt: "Smart casual layered look with jacket and sneakers",
  },
  {
    src: "/outfit-5.jpg",
    alt: "Relaxed weekend style with comfortable layers",
  },
];

/** Minimal loading UI so the root never shows a fully blank screen during auth check. */
function LandingLoadingState() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <span className="font-serif text-xl italic tracking-tight text-[rgba(249,244,237,0.7)]">
          OutfAI
        </span>
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-[rgba(214,188,140,0.3)] border-t-[rgba(214,188,140,0.9)]"
          aria-hidden
        />
        <span className="text-xs uppercase tracking-widest text-[rgba(224,211,188,0.5)]">
          Loading
        </span>
      </div>
    </main>
  );
}

export default function HomePage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % GALLERY_IMAGES.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LandingLoadingState />;
  }

  if (isAuthenticated) {
    return <AuthenticatedHome />;
  }

  return (
    <main className="relative min-h-[100dvh] bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />

        <div className="absolute left-[2%] top-[31%] h-[20rem] w-[20rem] rounded-full bg-white/[0.045] blur-[95px] sm:h-[24rem] sm:w-[24rem] xl:h-[28rem] xl:w-[28rem]" />
        <div className="absolute left-[5%] top-[39%] h-[14rem] w-[14rem] rounded-full bg-[rgba(214,188,140,0.05)] blur-[90px] sm:h-[18rem] sm:w-[18rem]" />

        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:38px_38px] sm:[background-size:46px_46px] xl:[background-size:56px_56px] 2xl:[background-size:64px_64px] opacity-[0.04]" />

        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent opacity-40" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_24%,rgba(0,0,0,0.28)_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='white'%3E%3Ccircle cx='10' cy='14' r='1'/%3E%3Ccircle cx='46' cy='28' r='1'/%3E%3Ccircle cx='92' cy='18' r='1'/%3E%3Ccircle cx='130' cy='48' r='1'/%3E%3Ccircle cx='32' cy='82' r='1'/%3E%3Ccircle cx='76' cy='70' r='1'/%3E%3Ccircle cx='118' cy='94' r='1'/%3E%3Ccircle cx='20' cy='126' r='1'/%3E%3Ccircle cx='68' cy='138' r='1'/%3E%3Ccircle cx='142' cy='132' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[100vw] flex-col px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 lg:px-10 lg:py-4 xl:px-12 xl:py-4">
        <div className="mx-auto flex w-full max-w-[min(96vw,80rem)] flex-1 min-w-0 flex-col">
          <div className="mb-3 flex shrink-0 items-center justify-between sm:mb-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-base font-medium uppercase tracking-[0.34em] text-[rgba(245,242,236,0.96)] transition-colors duration-150 hover:text-white sm:text-lg"
            >
              <span className="relative">
                OutfAI
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[rgba(214,188,140,0.72)] transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>

            <div className="hidden items-center gap-3 text-sm md:flex xl:gap-4 xl:text-base">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-4 py-2.5 text-[rgba(241,235,226,0.86)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md xl:px-5 xl:py-3">
                <span className="h-2 w-2 rounded-full bg-[rgba(214,188,140,0.78)]" />
                Personal styling
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-white/[0.015] px-4 py-2.5 text-[rgba(241,235,226,0.58)] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-md xl:px-5 xl:py-3">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                Built for all occasions
              </span>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 items-center gap-4 pb-4 sm:gap-5 sm:pb-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.86fr)] lg:gap-5 lg:pb-0 xl:grid-cols-[minmax(0,1.22fr)_minmax(0,0.9fr)] xl:gap-6 2xl:grid-cols-[minmax(0,1.24fr)_minmax(0,0.92fr)]">
            <div className="order-2 min-w-0 self-center lg:order-1">
              <div className="relative w-full max-w-[min(46rem,100%)] xl:max-w-[min(58rem,100%)]">
                <div
                  aria-hidden="true"
                  className="absolute -left-6 top-16 h-[18rem] w-[18rem] rounded-full border border-white/[0.035] opacity-70"
                />

                <div className="relative mb-2 sm:mb-3">
                  <div className="mb-2 inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-[rgba(224,211,188,0.84)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md">
                    Your wardrobe, refined by AI
                  </div>

                  <h1 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] italic leading-[0.84] tracking-[-0.03em] text-[rgba(249,244,237,0.98)] [text-shadow:0_0_22px_rgba(255,255,255,0.04)] sm:text-[clamp(2rem,5vw,3.25rem)]">
                    Dress
                  </h1>
                  <h1 className="mt-0.5 font-serif text-[clamp(1.75rem,4vw,2.75rem)] italic leading-[0.84] tracking-[-0.03em] text-[rgba(204,184,149,0.74)] sm:mt-1 sm:text-[clamp(2rem,5vw,3.25rem)]">
                    with clarity.
                  </h1>
                </div>

                <p className="max-w-[24rem] text-sm leading-snug text-[rgba(240,235,228,0.78)] sm:max-w-[30rem] lg:max-w-[34rem] xl:max-w-[38rem]">
                  OutfAI helps you organize your closet, build polished outfits,
                  and make everyday outfit decisions with more ease. Our goal is
                  to save you time, help you save money, reduce wardrobe stress,
                  and bring more confidence to the way you get dressed.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-[rgba(245,240,232,1)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-[rgba(34,28,22,0.94)] shadow-[0_18px_42px_-24px_rgba(255,255,255,0.22)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_52px_-22px_rgba(255,255,255,0.26)]"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-white/[0.14] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px bg-white/70"
                    />
                    <span className="relative inline-flex items-center gap-2">
                      Create account
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-5 py-3 text-sm uppercase tracking-[0.22em] text-[rgba(245,242,236,0.9)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md transition-all duration-200 hover:bg-white/[0.04]"
                  >
                    Sign in
                  </Link>
                </div>

                <div className="mt-4 hidden items-center gap-2 text-sm lg:flex xl:gap-3 xl:text-base">
                  <span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-4 py-2.5 text-[rgba(242,236,227,0.84)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md">
                    Outfit planning
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.06)] bg-white/[0.015] px-4 py-2.5 text-[rgba(242,236,227,0.7)] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-md">
                    Closet organization
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.05)] bg-white/[0.01] px-4 py-2.5 text-[rgba(242,236,227,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md">
                    AI recommendations
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 flex min-w-0 w-full justify-start self-center lg:order-2 lg:justify-center">
              <div className="relative w-full min-w-0 max-w-[21.5rem] sm:max-w-[23rem] lg:max-w-[24rem] xl:max-w-[25.5rem] 2xl:max-w-[27rem]">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[10%] top-[10%] h-[70%] rounded-full bg-white/[0.025] blur-[80px]"
                />

                <div className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,14,0.72)] shadow-[0_24px_70px_-34px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:rounded-[1.25rem]">
                  <div className="absolute inset-0 rounded-xl bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.015))] sm:rounded-[1.25rem]" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-white/[0.03] sm:rounded-[1.25rem]" />
                  <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-18px_40px_rgba(0,0,0,0.18)] sm:rounded-[1.25rem]" />

                  <div className="relative p-4 sm:p-5 lg:p-5 xl:p-6">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                          Featured looks
                        </div>
                        <div className="mt-1.5 text-base text-[rgba(248,244,238,0.9)] sm:text-lg">
                          A calmer way to plan what you wear.
                        </div>
                      </div>

                      <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-white/[0.015] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:flex">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-[rgba(241,235,226,0.66)]"
                        >
                          <path d="M6 7h12M6 12h8M6 17h10" />
                        </svg>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.07)] bg-black/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:rounded-[1rem]">
                      <div className="relative aspect-[10/13] sm:aspect-[7/9] lg:aspect-[10/13] xl:aspect-[11/14] w-full">
                        {GALLERY_IMAGES.map((item, index) => (
                          <div
                            key={item.src}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                              activeImage === index
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          >
                            <Image
                              src={item.src}
                              alt={item.alt}
                              fill
                              priority={index === 0}
                              className="object-cover"
                            />
                          </div>
                        ))}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                        <div className="absolute left-4 right-4 bottom-4 sm:left-4 sm:right-auto sm:bottom-4 sm:max-w-[12.5rem]">
                          <div className="rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-md">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-[rgba(214,188,140,0.72)]">
                              Refined styling
                            </div>
                            <div className="mt-2 text-sm leading-6 text-[rgba(248,244,238,0.92)]">
                              Build better outfits from pieces you already own,
                              without second guessing.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-2">
                      {GALLERY_IMAGES.map((_, index) => (
                        <span
                          key={index}
                          className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                            activeImage === index
                              ? "bg-[rgba(214,188,140,0.82)]"
                              : "bg-white/20"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-black/[0.18] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                        <div className="text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                          Plan
                        </div>
                        <div className="mt-1.5 text-sm text-[rgba(248,244,238,0.92)]">
                          Build outfits faster.
                        </div>
                      </div>

                      <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-black/[0.18] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                        <div className="text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                          Curate
                        </div>
                        <div className="mt-1.5 text-sm text-[rgba(248,244,238,0.92)]">
                          Organize your closet.
                        </div>
                      </div>

                      <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-black/[0.18] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                        <div className="text-xs uppercase tracking-[0.22em] text-[rgba(210,194,167,0.42)]">
                          Refine
                        </div>
                        <div className="mt-1.5 text-sm text-[rgba(248,244,238,0.92)]">
                          Repeat what works.
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <Link
                        href="/signup"
                        className="text-sm text-[rgba(248,244,238,0.92)] underline underline-offset-4 transition-colors duration-150 hover:text-[rgba(214,188,140,0.96)] sm:text-base"
                      >
                        Start building your wardrobe
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-3 hidden text-[10px] leading-snug text-[rgba(238,230,216,0.38)] xl:block">
                  A smarter, more intentional way to plan what you wear starts
                  here.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
