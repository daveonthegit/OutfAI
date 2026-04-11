"use client";

import React, { useState, useEffect } from "react";
import { BrutalistButton } from "@/components/brutalist-button";
import { BrutalistInput } from "@/components/brutalist-input";
import {
  BrutalistCard,
  BrutalistCardHeader,
  BrutalistCardTitle,
  BrutalistCardContent,
} from "@/components/brutalist-card";
import { BrutalistToggle } from "@/components/brutalist-toggle";
import { BrutalistCheckbox } from "@/components/brutalist-checkbox";
import { BrutalistSlider } from "@/components/brutalist-slider";
import { BrutalistProgress } from "@/components/brutalist-progress";
import { BrutalistBadge } from "@/components/brutalist-badge";
import { BrutalistAvatar } from "@/components/brutalist-avatar";
import { BrutalistTabs, BrutalistTab } from "@/components/brutalist-tabs";
import { BrutalistDivider } from "@/components/brutalist-divider";
import { BrutalistTooltip } from "@/components/brutalist-tooltip";
import { Tag } from "@/components/tag";

const SECTIONS = [
  { id: "philosophy", label: "Philosophy" },
  { id: "palette", label: "Color Palette" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "icons", label: "Iconography" },
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs" },
  { id: "tags", label: "Tags & Badges" },
  { id: "controls", label: "Controls" },
  { id: "feedback", label: "Feedback" },
  { id: "cards", label: "Cards" },
  { id: "navigation", label: "Navigation" },
  { id: "avatars", label: "Avatars" },
  { id: "misc", label: "Misc" },
  { id: "motion", label: "Motion" },
  { id: "guidelines", label: "Guidelines" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-secondary border border-border p-4 mt-3 overflow-x-auto">
      <code className="text-[11px] font-mono text-foreground leading-relaxed whitespace-pre">
        {children}
      </code>
    </pre>
  );
}

function SectionHeader({
  id,
  label,
  number,
}: {
  id: string;
  label: string;
  number: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 mb-10 flex items-baseline gap-4">
      <span className="text-[10px] font-mono text-signal-orange tracking-wider">
        {number}
      </span>
      <h2 className="text-2xl md:text-3xl font-serif italic text-foreground">
        {label}
      </h2>
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-12">
      {title && (
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-5 font-medium">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export default function StyleDocPage() {
  const [toggleValue, setToggleValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState("philosophy");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] font-medium">
              OutfAI
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              /
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Design System
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            v1.0
          </span>
        </div>
      </header>

      <div className="pt-20 md:pt-24 flex">
        {/* Sidebar TOC - hidden on mobile */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-border py-8 px-6">
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-6 font-medium">
            Contents
          </p>
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((section, i) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`flex items-center gap-3 py-1.5 text-[11px] transition-colors duration-100 ${
                  activeSection === section.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="font-mono text-[9px] w-5 text-right tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="uppercase tracking-[0.15em]">
                  {section.label}
                </span>
                {activeSection === section.id && (
                  <span className="w-1.5 h-1.5 bg-signal-orange ml-auto" />
                )}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 px-4 md:px-8 lg:px-16 pb-28 max-w-5xl">
          {/* Hero */}
          <section className="py-16 md:py-24 border-b border-border mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-signal-orange mb-6 font-medium">
              OutfAI Design System
            </p>
            <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl mb-8 text-balance text-foreground">
              Cybersigilism
              <br />
              Style Reference
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              A brutalist, fashion-forward design language inspired by 2000s
              editorial aesthetics, cybersigilism, and neo-brutalist digital
              interfaces. Zero rounded corners. Maximum typographic tension.
              This document is the single source of truth for all visual and
              interaction patterns across OutfAI.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <BrutalistBadge variant="orange">Brutalist</BrutalistBadge>
              <BrutalistBadge variant="default">Editorial</BrutalistBadge>
              <BrutalistBadge variant="outline">2000s</BrutalistBadge>
            </div>
          </section>

          {/* 01 - Philosophy */}
          <section className="mb-20">
            <SectionHeader id="philosophy" label="Philosophy" number="01" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Sharp Edges",
                  text: "Zero border radius everywhere. No friendly curves. Every element cuts with precision. border-radius: 0 is a design choice, not an oversight.",
                },
                {
                  title: "Editorial Type",
                  text: "Oversized serif italics for mood. Tight uppercase tracking for UI. Typographic hierarchy as architecture. The font is the brand.",
                },
                {
                  title: "Restrained Color",
                  text: "Signal orange used sparingly. Most UI in monochrome. Color as punctuation, not decoration. When everything is loud, nothing is.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="border-l-2 border-signal-orange pl-6"
                >
                  <h3 className="text-sm uppercase tracking-widest font-medium mb-3 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <BrutalistDivider />

          {/* 02 - Color Palette */}
          <section className="my-20">
            <SectionHeader id="palette" label="Color Palette" number="02" />

            <SubSection title="Core Tokens">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    name: "Background",
                    cls: "bg-background border border-border",
                    light: "#F4F3EF",
                    dark: "#0A0A0A",
                    token: "--background",
                  },
                  {
                    name: "Foreground",
                    cls: "bg-foreground",
                    light: "#0A0A0A",
                    dark: "#F4F3EF",
                    token: "--foreground",
                  },
                  {
                    name: "Card",
                    cls: "bg-card border border-border",
                    light: "#FFFFFF",
                    dark: "#111111",
                    token: "--card",
                  },
                  {
                    name: "Muted",
                    cls: "bg-muted border border-border",
                    light: "#E8E7E3",
                    dark: "#1A1A1A",
                    token: "--muted",
                  },
                  {
                    name: "Secondary",
                    cls: "bg-secondary border border-border",
                    light: "#E8E7E3",
                    dark: "#1A1A1A",
                    token: "--secondary",
                  },
                  {
                    name: "Border",
                    cls: "bg-border",
                    light: "#D4D3CF",
                    dark: "#2A2A2A",
                    token: "--border",
                  },
                  {
                    name: "Muted FG",
                    cls: "bg-muted-foreground",
                    light: "#6A6A6A",
                    dark: "#8A8A8A",
                    token: "--muted-foreground",
                  },
                  {
                    name: "Ring",
                    cls: "bg-ring",
                    light: "#0A0A0A",
                    dark: "#F4F3EF",
                    token: "--ring",
                  },
                ].map((c) => (
                  <div key={c.name}>
                    <div className={`h-20 mb-3 ${c.cls}`} />
                    <p className="text-[10px] uppercase tracking-widest font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono mt-1">
                      {c.token}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono">
                      L {c.light} / D {c.dark}
                    </p>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Accent Colors">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    name: "Signal Orange",
                    cls: "bg-signal-orange",
                    value: "#FF4D00",
                    token: "--signal-orange",
                    usage: "Primary actions, highlights, active states",
                  },
                  {
                    name: "Acid Lime",
                    cls: "bg-acid-lime",
                    value: "L #7ACC00 / D #B6FF00",
                    token: "--acid-lime",
                    usage: "Status indicators, toggles, success",
                  },
                  {
                    name: "Electric Blue",
                    cls: "bg-electric-blue",
                    value: "#0038FF",
                    token: "--electric-blue",
                    usage: "Links, information, rare emphasis",
                  },
                  {
                    name: "Chrome Silver",
                    cls: "bg-chrome-silver",
                    value: "L #8A8A8A / D #C9CCD6",
                    token: "--chrome-silver",
                    usage: "Metadata, tertiary text, subtle marks",
                  },
                ].map((c) => (
                  <div key={c.name}>
                    <div className={`h-20 mb-3 ${c.cls}`} />
                    <p className="text-[10px] uppercase tracking-widest font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono mt-1">
                      {c.token}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono">
                      {c.value}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {c.usage}
                    </p>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Usage Rule">
              <div className="bg-secondary border border-border p-6">
                <p className="text-xs text-foreground leading-relaxed">
                  Maximum <strong>2 accent colors per screen</strong>. Signal
                  Orange is the primary accent and should be used for the single
                  most important action or highlight. Acid Lime is reserved for
                  status/toggles. Electric Blue is rare. Chrome Silver is for
                  metadata only.
                </p>
              </div>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 03 - Typography */}
          <section className="my-20">
            <SectionHeader id="typography" label="Typography" number="03" />

            <SubSection title="Typefaces">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-signal-orange mb-4 font-medium">
                    Display / Headings
                  </p>
                  <p className="font-serif italic text-5xl md:text-6xl mb-4 text-foreground">
                    Bodoni Moda
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    Used for headlines, mood text, and editorial moments. Italic
                    at all display sizes for maximum editorial contrast against
                    the sharp UI elements. Never used for body text.
                  </p>
                  <CodeBlock>{`font-serif italic text-5xl   /* Display L */\nfont-serif italic text-3xl   /* Display M */\nfont-serif italic text-2xl   /* Display S */`}</CodeBlock>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-signal-orange mb-4 font-medium">
                    UI / Body
                  </p>
                  <p className="text-5xl md:text-6xl font-medium mb-4 text-foreground">
                    Hanken Grotesk
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    Used for all UI elements, labels, navigation, and body text.
                    Uppercase with wide letter-spacing for labels. Sentence case
                    for body.
                  </p>
                  <CodeBlock>{`text-xs uppercase tracking-[0.3em]  /* Label */\ntext-[10px] uppercase tracking-[0.2em] /* Meta */\ntext-sm leading-relaxed               /* Body */`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Type Scale">
              <div className="flex flex-col gap-6 border border-border p-6">
                <div className="flex items-baseline gap-6 border-b border-border pb-4">
                  <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">
                    Display L
                  </span>
                  <span className="font-serif italic text-5xl md:text-7xl text-foreground">
                    Aa
                  </span>
                </div>
                <div className="flex items-baseline gap-6 border-b border-border pb-4">
                  <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">
                    Display M
                  </span>
                  <span className="font-serif italic text-3xl md:text-5xl text-foreground">
                    Aa
                  </span>
                </div>
                <div className="flex items-baseline gap-6 border-b border-border pb-4">
                  <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">
                    Display S
                  </span>
                  <span className="font-serif italic text-2xl md:text-3xl text-foreground">
                    Aa
                  </span>
                </div>
                <div className="flex items-baseline gap-6 border-b border-border pb-4">
                  <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">
                    Label
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] font-medium text-foreground">
                    {"LABEL TEXT"}
                  </span>
                </div>
                <div className="flex items-baseline gap-6 border-b border-border pb-4">
                  <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">
                    Meta
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
                    {"META INFORMATION"}
                  </span>
                </div>
                <div className="flex items-baseline gap-6">
                  <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">
                    Body
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">
                    Body text uses sentence case with relaxed leading for
                    comfortable reading.
                  </span>
                </div>
              </div>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 04 - Spacing */}
          <section className="my-20">
            <SectionHeader id="spacing" label="Spacing" number="04" />

            <SubSection title="4px Base Grid">
              <div className="flex flex-wrap gap-6 items-end mb-8">
                {[
                  { px: 4, tw: "1" },
                  { px: 8, tw: "2" },
                  { px: 12, tw: "3" },
                  { px: 16, tw: "4" },
                  { px: 20, tw: "5" },
                  { px: 24, tw: "6" },
                  { px: 32, tw: "8" },
                  { px: 40, tw: "10" },
                  { px: 48, tw: "12" },
                  { px: 64, tw: "16" },
                ].map((size) => (
                  <div key={size.px} className="flex flex-col items-center">
                    <div
                      className="bg-signal-orange"
                      style={{ width: size.px, height: size.px }}
                    />
                    <p className="text-[9px] text-muted-foreground font-mono mt-2">
                      {size.px}px
                    </p>
                    <p className="text-[8px] text-muted-foreground font-mono">
                      p-{size.tw}
                    </p>
                  </div>
                ))}
              </div>
              <CodeBlock>{`/* Use Tailwind spacing scale, not arbitrary values */\ngap-4       /* 16px - standard component gap */\ngap-6       /* 24px - section internal spacing */\npy-3        /* 12px - button vertical padding */\npx-5        /* 20px - button horizontal padding */\nmb-20       /* 80px - section margin */`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 05 - Iconography */}
          <section className="my-20">
            <SectionHeader id="icons" label="Iconography" number="05" />

            <SubSection title="Icon System">
              <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-xl">
                All icons are hand-drawn inline SVGs with a consistent 24x24
                viewBox, 1.5px stroke width, no fill. This keeps the raw,
                editorial feel and avoids dependency on icon libraries.
              </p>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {[
                  {
                    label: "Grid",
                    path: (
                      <>
                        <rect x="3" y="3" width="18" height="18" rx="0" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </>
                    ),
                  },
                  {
                    label: "Mood",
                    path: (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </>
                    ),
                  },
                  {
                    label: "Layers",
                    path: (
                      <>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </>
                    ),
                  },
                  {
                    label: "Plus",
                    path: (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </>
                    ),
                  },
                  {
                    label: "Archive",
                    path: (
                      <>
                        <polyline points="21 8 21 21 3 21 3 8" />
                        <rect x="1" y="3" width="22" height="5" />
                        <line x1="10" y1="12" x2="14" y2="12" />
                      </>
                    ),
                  },
                  {
                    label: "Arrow",
                    path: (
                      <>
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </>
                    ),
                  },
                  {
                    label: "Save",
                    path: (
                      <>
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </>
                    ),
                  },
                  {
                    label: "Share",
                    path: (
                      <>
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </>
                    ),
                  },
                ].map((icon) => (
                  <div
                    key={icon.label}
                    className="flex flex-col items-center gap-2 py-4 border border-border"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      {icon.path}
                    </svg>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">
                      {icon.label}
                    </span>
                  </div>
                ))}
              </div>
              <CodeBlock>{`<svg width="18" height="18" viewBox="0 0 24 24"\n     fill="none" stroke="currentColor" strokeWidth="1.5">\n  {/* path data */}\n</svg>\n\n/* Sizes: 14px (inline), 18px (nav), 24px (feature) */`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 06 - Buttons */}
          <section className="my-20">
            <SectionHeader id="buttons" label="Buttons" number="06" />

            <SubSection title="Variants">
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <BrutalistButton variant="solid">Solid</BrutalistButton>
                <BrutalistButton variant="outline">Outline</BrutalistButton>
                <BrutalistButton variant="ghost">Ghost</BrutalistButton>
                <BrutalistButton variant="solid" disabled>
                  Disabled
                </BrutalistButton>
              </div>
              <CodeBlock>{`<BrutalistButton variant="solid">Label</BrutalistButton>\n<BrutalistButton variant="outline">Label</BrutalistButton>\n<BrutalistButton variant="ghost">Label</BrutalistButton>`}</CodeBlock>
            </SubSection>

            <SubSection title="Sizes">
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <BrutalistButton variant="solid" size="sm">
                  Small
                </BrutalistButton>
                <BrutalistButton variant="solid" size="md">
                  Medium
                </BrutalistButton>
                <BrutalistButton variant="solid" size="lg">
                  Large
                </BrutalistButton>
              </div>
              <CodeBlock>{`size="sm"  /* text-[10px] px-3 py-2 */\nsize="md"  /* text-xs    px-5 py-3 */\nsize="lg"  /* text-sm    px-6 py-4 */`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 07 - Inputs */}
          <section className="my-20">
            <SectionHeader id="inputs" label="Inputs" number="07" />

            <SubSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-4">
                <BrutalistInput label="With Label" placeholder="Enter text" />
                <BrutalistInput placeholder="Without label" />
                <BrutalistInput
                  label="Disabled"
                  placeholder="Cannot edit"
                  disabled
                />
              </div>
              <CodeBlock>{`<BrutalistInput label="Email" placeholder="you@email.com" />\n<BrutalistInput placeholder="Search..." />\n<BrutalistInput disabled />`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 08 - Tags & Badges */}
          <section className="my-20">
            <SectionHeader id="tags" label="Tags & Badges" number="08" />

            <SubSection title="Tags">
              <div className="flex flex-wrap gap-3 mb-4">
                <Tag>Default</Tag>
                <Tag variant="accent">Accent</Tag>
              </div>
              <CodeBlock>{`<Tag>Default</Tag>\n<Tag variant="accent">Accent</Tag>`}</CodeBlock>
            </SubSection>

            <SubSection title="Badges">
              <div className="flex flex-wrap gap-3 mb-4">
                <BrutalistBadge>Default</BrutalistBadge>
                <BrutalistBadge variant="orange">Orange</BrutalistBadge>
                <BrutalistBadge variant="lime">Lime</BrutalistBadge>
                <BrutalistBadge variant="blue">Blue</BrutalistBadge>
                <BrutalistBadge variant="outline">Outline</BrutalistBadge>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 mb-4">
                <BrutalistBadge size="sm">Small</BrutalistBadge>
                <BrutalistBadge size="md">Medium</BrutalistBadge>
              </div>
              <CodeBlock>{`<BrutalistBadge variant="orange">New</BrutalistBadge>\n<BrutalistBadge variant="lime" size="sm">Active</BrutalistBadge>`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 09 - Controls */}
          <section className="my-20">
            <SectionHeader id="controls" label="Controls" number="09" />

            <SubSection title="Toggle">
              <div className="flex flex-wrap gap-8 items-start mb-4">
                <BrutalistToggle
                  label="Toggle Switch"
                  checked={toggleValue}
                  onChange={setToggleValue}
                />
              </div>
              <CodeBlock>{`<BrutalistToggle\n  label="AI Mode"\n  checked={value}\n  onChange={setValue}\n/>`}</CodeBlock>
            </SubSection>

            <SubSection title="Checkbox">
              <div className="flex flex-wrap gap-8 items-start mb-4">
                <BrutalistCheckbox
                  label="Checkbox Option"
                  checked={checkboxValue}
                  onChange={setCheckboxValue}
                />
              </div>
              <CodeBlock>{`<BrutalistCheckbox\n  label="Remember me"\n  checked={value}\n  onChange={setValue}\n/>`}</CodeBlock>
            </SubSection>

            <SubSection title="Slider">
              <div className="max-w-md mb-4">
                <BrutalistSlider
                  label="Value"
                  value={sliderValue}
                  onChange={setSliderValue}
                  showValue
                />
              </div>
              <CodeBlock>{`<BrutalistSlider\n  label="Confidence"\n  value={val}\n  onChange={setVal}\n  showValue\n  min={0} max={100}\n/>`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 10 - Feedback */}
          <section className="my-20">
            <SectionHeader id="feedback" label="Feedback" number="10" />

            <SubSection title="Progress Bars">
              <div className="max-w-md flex flex-col gap-6 mb-4">
                <BrutalistProgress value={75} label="Default" showValue />
                <BrutalistProgress
                  value={60}
                  variant="orange"
                  label="Orange"
                  showValue
                />
                <BrutalistProgress
                  value={40}
                  variant="lime"
                  label="Lime"
                  showValue
                />
              </div>
              <CodeBlock>{`<BrutalistProgress value={75} label="Upload" showValue />\n<BrutalistProgress value={60} variant="orange" />`}</CodeBlock>
            </SubSection>

            <SubSection title="Tooltip">
              <div className="flex flex-wrap gap-8 mb-4">
                <BrutalistTooltip content="Top tooltip" position="top">
                  <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help text-foreground">
                    Top
                  </span>
                </BrutalistTooltip>
                <BrutalistTooltip content="Bottom tooltip" position="bottom">
                  <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help text-foreground">
                    Bottom
                  </span>
                </BrutalistTooltip>
                <BrutalistTooltip content="Left tooltip" position="left">
                  <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help text-foreground">
                    Left
                  </span>
                </BrutalistTooltip>
                <BrutalistTooltip content="Right tooltip" position="right">
                  <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help text-foreground">
                    Right
                  </span>
                </BrutalistTooltip>
              </div>
              <CodeBlock>{`<BrutalistTooltip content="Hint" position="top">\n  <span>Hover me</span>\n</BrutalistTooltip>`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 11 - Cards */}
          <section className="my-20">
            <SectionHeader id="cards" label="Cards" number="11" />

            <SubSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <BrutalistCard variant="default">
                  <BrutalistCardHeader>
                    <BrutalistCardTitle>Default</BrutalistCardTitle>
                  </BrutalistCardHeader>
                  <BrutalistCardContent>
                    <p className="text-xs text-muted-foreground">
                      Standard card. Subtle border, no shadow. Use for most
                      containers.
                    </p>
                  </BrutalistCardContent>
                </BrutalistCard>
                <BrutalistCard variant="elevated">
                  <BrutalistCardHeader>
                    <BrutalistCardTitle>Elevated</BrutalistCardTitle>
                  </BrutalistCardHeader>
                  <BrutalistCardContent>
                    <p className="text-xs text-muted-foreground">
                      Hard 4px offset shadow. Use sparingly for emphasis.
                    </p>
                  </BrutalistCardContent>
                </BrutalistCard>
                <BrutalistCard variant="outlined">
                  <BrutalistCardHeader>
                    <BrutalistCardTitle>Outlined</BrutalistCardTitle>
                  </BrutalistCardHeader>
                  <BrutalistCardContent>
                    <p className="text-xs text-muted-foreground">
                      Heavy 2px border. Use for interactive selections.
                    </p>
                  </BrutalistCardContent>
                </BrutalistCard>
              </div>
              <CodeBlock>{`<BrutalistCard variant="elevated">\n  <BrutalistCardHeader>\n    <BrutalistCardTitle>Title</BrutalistCardTitle>\n  </BrutalistCardHeader>\n  <BrutalistCardContent>\n    Content here\n  </BrutalistCardContent>\n</BrutalistCard>`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 12 - Navigation */}
          <section className="my-20">
            <SectionHeader id="navigation" label="Navigation" number="12" />

            <SubSection title="Tabs">
              <div className="mb-4">
                <BrutalistTabs>
                  <BrutalistTab
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                  </BrutalistTab>
                  <BrutalistTab
                    active={activeTab === "details"}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </BrutalistTab>
                  <BrutalistTab
                    active={activeTab === "settings"}
                    onClick={() => setActiveTab("settings")}
                  >
                    Settings
                  </BrutalistTab>
                </BrutalistTabs>
                <div className="border border-t-0 border-border p-6">
                  <p className="text-xs text-muted-foreground">
                    Active tab:{" "}
                    <span className="text-foreground font-medium uppercase tracking-widest">
                      {activeTab}
                    </span>
                  </p>
                </div>
              </div>
              <CodeBlock>{`<BrutalistTabs>\n  <BrutalistTab active={isActive} onClick={handler}>\n    Label\n  </BrutalistTab>\n</BrutalistTabs>`}</CodeBlock>
            </SubSection>

            <SubSection title="Bottom Nav">
              <div className="bg-secondary border border-border p-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The global bottom navigation bar is fixed at the bottom of
                  every screen. It contains 5 primary destinations (Today, Mood,
                  Closet, Add, Archive) and a theme toggle. Active state uses{" "}
                  <span className="text-signal-orange">signal orange</span> with
                  a subtle scale transform. All labels are 8-9px uppercase with
                  wide tracking.
                </p>
              </div>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 13 - Avatars */}
          <section className="my-20">
            <SectionHeader id="avatars" label="Avatars" number="13" />

            <SubSection title="Sizes & Status">
              <div className="flex flex-wrap gap-6 items-end mb-4">
                <div className="flex flex-col items-center gap-2">
                  <BrutalistAvatar size="sm" initials="SM" />
                  <span className="text-[8px] text-muted-foreground font-mono">
                    sm
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BrutalistAvatar size="md" initials="MD" />
                  <span className="text-[8px] text-muted-foreground font-mono">
                    md
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BrutalistAvatar size="lg" initials="LG" />
                  <span className="text-[8px] text-muted-foreground font-mono">
                    lg
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BrutalistAvatar size="md" initials="ON" status="online" />
                  <span className="text-[8px] text-muted-foreground font-mono">
                    online
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BrutalistAvatar size="md" initials="OF" status="offline" />
                  <span className="text-[8px] text-muted-foreground font-mono">
                    offline
                  </span>
                </div>
              </div>
              <CodeBlock>{`<BrutalistAvatar size="md" initials="AB" />\n<BrutalistAvatar size="lg" initials="AI" status="online" />`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 14 - Misc */}
          <section className="my-20">
            <SectionHeader id="misc" label="Misc" number="14" />

            <SubSection title="Dividers">
              <div className="flex flex-col gap-6 mb-4">
                <BrutalistDivider />
                <BrutalistDivider label="With Label" />
              </div>
              <CodeBlock>{`<BrutalistDivider />\n<BrutalistDivider label="Section" />`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 15 - Motion */}
          <section className="my-20">
            <SectionHeader id="motion" label="Motion" number="15" />

            <SubSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border p-6">
                  <p className="text-[10px] uppercase tracking-widest text-signal-orange font-medium mb-3">
                    Allowed
                  </p>
                  <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-acid-lime" />{" "}
                      {"transition-colors duration-100"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-acid-lime" />{" "}
                      {"transition-transform duration-100"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-acid-lime" />{" "}
                      {"transition-all duration-100"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-acid-lime" />{" "}
                      {"active:translate-y-px (button press)"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-acid-lime" />{" "}
                      {"No icon scale on hover (color / weight only)"}
                    </li>
                  </ul>
                </div>
                <div className="border border-border p-6">
                  <p className="text-[10px] uppercase tracking-widest text-signal-orange font-medium mb-3">
                    Forbidden
                  </p>
                  <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-signal-orange" />{" "}
                      {"No bounce, spring, or elastic easing"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-signal-orange" />{" "}
                      {"No durations > 200ms"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-signal-orange" />{" "}
                      {"No fade-in/out transitions"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-signal-orange" />{" "}
                      {"No skeleton loading shimmer"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-signal-orange" />{" "}
                      {"No parallax or scroll-linked effects"}
                    </li>
                  </ul>
                </div>
              </div>
              <CodeBlock>{`/* Standard transition pattern */\ntransition-colors duration-100\ntransition-all duration-100\n\n/* Button micro-interaction */\nactive:translate-y-px\n\n/* Max duration: 200ms. Prefer 100ms. */`}</CodeBlock>
            </SubSection>
          </section>

          <BrutalistDivider />

          {/* 16 - Guidelines */}
          <section className="my-20">
            <SectionHeader id="guidelines" label="Guidelines" number="16" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border p-6">
                <h3 className="text-sm uppercase tracking-widest font-medium mb-5 flex items-center gap-3 text-foreground">
                  <span className="w-3 h-3 bg-acid-lime" />
                  Do
                </h3>
                <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Use signal orange for the single most important action per
                    screen
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Maintain uppercase tracking on all labels, navigation, and
                    meta text
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Keep interactions fast (100ms transitions, no delay)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Use serif italic for editorial / emotional / mood moments
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Leave generous whitespace between sections (80px+)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Prefer inline SVG icons over icon libraries
                  </li>
                </ul>
              </div>
              <div className="border border-border p-6">
                <h3 className="text-sm uppercase tracking-widest font-medium mb-5 flex items-center gap-3 text-foreground">
                  <span className="w-3 h-3 bg-signal-orange" />
                  {"Don't"}
                </h3>
                <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Never use border-radius on any element
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Avoid soft shadows, blur effects, or glassmorphism
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    {"Don't use gradients (solid colors only)"}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    {"Don't mix more than 2 accent colors per screen"}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    Avoid bouncy, playful, or elastic animations
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground mt-0.5 shrink-0">-</span>
                    {"Don't use emojis as icons or decorative elements"}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <BrutalistDivider />

          {/* Footer quote */}
          <section className="my-20">
            <p className="font-serif italic text-2xl md:text-4xl text-muted-foreground text-balance">
              {'"Fashion is architecture: it is a matter of proportions."'}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-6">
              — Coco Chanel
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
