import React from "react";
import type { Metadata } from "next";
import { Hanken_Grotesk, Bodoni_Moda } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalAppShell } from "@/components/layout/conditional-app-shell";
import { ConditionalBottomNav } from "@/components/layout/conditional-bottom-nav";
import { Providers } from "@/components/providers";
import { PageTransition } from "@/components/page-transition";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "OutfAI",
  description: "AI-powered outfit curation for the modern wardrobe",
  generator: "v0.app",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${hankenGrotesk.variable} ${bodoniModa.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <OnboardingGuard>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <ConditionalAppShell>
                <PageTransition>{children}</PageTransition>
              </ConditionalAppShell>
              <ConditionalBottomNav />
              <Toaster richColors position="bottom-center" />
            </ThemeProvider>
          </OnboardingGuard>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
