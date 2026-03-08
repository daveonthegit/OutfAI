"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Editorial noir background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />

        <div className="absolute left-[50%] top-[42%] h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[110px] sm:h-[28rem] sm:w-[28rem] xl:h-[34rem] xl:w-[34rem]" />
        <div className="absolute left-[50%] top-[42%] h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(214,188,140,0.05)] blur-[95px] sm:h-[20rem] sm:w-[20rem]" />

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

      <div className="relative mx-auto min-h-screen w-full px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10 lg:py-8 xl:px-12 xl:py-9 2xl:px-16 2xl:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[min(96vw,3200px)] items-center justify-center sm:min-h-[calc(100vh-2.5rem)] md:min-h-[calc(100vh-3rem)]">
          <div className="w-full max-w-[42rem] xl:max-w-[52rem] 2xl:max-w-[60rem]">
            <div className="relative overflow-hidden rounded-[1.8rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,14,0.72)] shadow-[0_24px_70px_-34px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <div className="absolute inset-0 rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.015))]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
              <div className="absolute inset-0 rounded-[1.8rem] ring-1 ring-white/[0.03]" />
              <div className="absolute inset-0 rounded-[1.8rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-18px_40px_rgba(0,0,0,0.18)]" />

              <div className="relative p-10 text-center sm:p-12 lg:p-14 xl:p-16 2xl:p-20">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:h-24 sm:w-24 xl:h-28 xl:w-28">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-[rgba(241,235,226,0.72)] sm:h-8 sm:w-8 xl:h-10 xl:w-10"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>

                <h1 className="font-serif text-[clamp(2.8rem,3.6vw,4.5rem)] italic leading-[0.92] tracking-tight text-[rgba(249,244,237,0.98)] [text-shadow:0_0_22px_rgba(255,255,255,0.04)]">
                  Check your email
                </h1>

                <p className="mx-auto mt-5 max-w-[38rem] text-[clamp(1.35rem,1.35vw,1.9rem)] leading-relaxed text-[rgba(240,235,228,0.78)]">
                  We sent a verification link to{" "}
                  <strong className="font-medium text-[rgba(248,244,238,0.96)]">
                    {email}
                  </strong>
                  . Click the link to verify your account and sign in.
                </p>

                <p className="mx-auto mt-6 max-w-[38rem] text-[clamp(1.08rem,1vw,1.4rem)] leading-relaxed text-[rgba(242,236,227,0.5)]">
                  Didn&apos;t get the email? Check spam or{" "}
                  <Link
                    href="/login"
                    className="text-[rgba(248,244,238,0.92)] underline underline-offset-4 transition-colors duration-150 hover:text-[rgba(214,188,140,0.96)]"
                  >
                    sign in
                  </Link>{" "}
                  to request a new link.
                </p>

                <Link
                  href="/login"
                  className="group relative mt-10 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(245,240,232,1)] px-8 py-5 text-[clamp(1rem,0.96vw,1.3rem)] uppercase tracking-[0.22em] text-[rgba(34,28,22,0.94)] shadow-[0_18px_42px_-24px_rgba(255,255,255,0.22)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_52px_-22px_rgba(255,255,255,0.26)]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-white/[0.14]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-white/70"
                  />
                  <span className="relative">Back to sign in</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <span className="h-6 w-6 animate-spin rounded-full border border-foreground/30 border-t-foreground" />
        </main>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
