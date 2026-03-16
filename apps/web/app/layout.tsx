import React from "react";
import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalAppShell } from "@/components/layout/conditional-app-shell";
import { ConditionalBottomNav } from "@/components/layout/conditional-bottom-nav";
import { Providers } from "@/components/providers";
import { PageTransition } from "@/components/page-transition";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
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
      <body
        className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased`}
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
