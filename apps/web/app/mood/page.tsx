"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Mood {
  id: string;
  label: string;
  accent: string;
  description: string;
}

const MOODS: Mood[] = [
  {
    id: "bold",
    label: "Bold",
    accent: "var(--signal-orange)",
    description: "Confident, statement-making",
  },
  {
    id: "minimal",
    label: "Minimal",
    accent: "var(--chrome-silver)",
    description: "Clean, understated",
  },
  {
    id: "relaxed",
    label: "Relaxed",
    accent: "var(--foreground)",
    description: "Effortless, comfortable",
  },
  {
    id: "sharp",
    label: "Sharp",
    accent: "var(--foreground)",
    description: "Precise, professional",
  },
  {
    id: "experimental",
    label: "Experimental",
    accent: "var(--acid-lime)",
    description: "Boundary-pushing, creative",
  },
  {
    id: "refined",
    label: "Refined",
    accent: "var(--electric-blue)",
    description: "Elevated, sophisticated",
  },
];

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);
  const router = useRouter();

  const activeMood = MOODS.find((m) => m.id === (hoveredMood || selectedMood));

  const handleContinue = () => {
    if (selectedMood) {
      router.push(`/?mood=${selectedMood}`);
    }
  };

  return (
    <main
      className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background transition-colors duration-300"
      style={{
        backgroundColor: selectedMood ? "var(--background)" : undefined,
      }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <Link
            href="/"
            className="text-base md:text-lg tracking-tight font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Step 1 of 2
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12 pt-20 pb-28">
        {/* Prompt */}
        <section className="mb-16 md:mb-20">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic text-foreground leading-[0.95] tracking-tight">
            how do you
          </h1>
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic leading-[0.95] tracking-tight transition-colors duration-200"
            style={{
              color: activeMood ? activeMood.accent : "var(--muted-foreground)",
            }}
          >
            feel today
          </h1>
        </section>

        {/* Mood options */}
        <section className="max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px]">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                onMouseEnter={() => setHoveredMood(mood.id)}
                onMouseLeave={() => setHoveredMood(null)}
                className={`relative text-left px-6 py-8 border transition-all duration-100 ${
                  selectedMood === mood.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent hover:border-foreground"
                }`}
              >
                {/* Accent line */}
                <div
                  className="absolute top-0 left-0 w-full h-[2px] transition-all duration-100"
                  style={{
                    backgroundColor:
                      selectedMood === mood.id || hoveredMood === mood.id
                        ? mood.accent
                        : "transparent",
                  }}
                />

                <span
                  className={`block font-serif text-2xl md:text-3xl italic mb-2 transition-colors duration-100 ${
                    selectedMood === mood.id
                      ? "text-background"
                      : "text-foreground"
                  }`}
                >
                  {mood.label}
                </span>
                <span
                  className={`block text-[10px] uppercase tracking-[0.2em] transition-colors duration-100 ${
                    selectedMood === mood.id
                      ? "text-background/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {mood.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Selected indicator */}
        {selectedMood && (
          <section className="mt-12 md:mt-16">
            <div className="flex items-center gap-4">
              <div
                className="w-2 h-2"
                style={{ backgroundColor: activeMood?.accent }}
              />
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Selected:{" "}
                <span className="text-foreground">{activeMood?.label}</span>
              </span>
            </div>
          </section>
        )}

        {/* Continue action - inline */}
        {selectedMood && (
          <section className="mt-8">
            <button
              onClick={handleContinue}
              className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] bg-foreground text-background hover:bg-foreground/90 transition-all duration-100 flex items-center gap-2"
            >
              Continue
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
