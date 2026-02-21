"use client";

import React from "react";

import { useState } from "react";
import Link from "next/link";
import { BrutalistButton } from "@/components/brutalist-button";
import { BrutalistInput } from "@/components/brutalist-input";
import { BrutalistToggle } from "@/components/brutalist-toggle";
import { BrutalistBadge } from "@/components/brutalist-badge";
import {
  BrutalistCard,
  BrutalistCardHeader,
  BrutalistCardTitle,
  BrutalistCardContent,
} from "@/components/brutalist-card";
import { BrutalistSlider } from "@/components/brutalist-slider";
import { BrutalistTabs } from "@/components/brutalist-tabs";
import { BrutalistAvatar } from "@/components/brutalist-avatar";
import { BrutalistDivider } from "@/components/brutalist-divider";
import { BrutalistTooltip } from "@/components/brutalist-tooltip";
import { BrutalistCheckbox } from "@/components/brutalist-checkbox";
import { BrutalistProgress } from "@/components/brutalist-progress";
import { Tag } from "@/components/tag";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium mb-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ComponentsKit() {
  const [toggleState, setToggleState] = useState(false);
  const [sliderValue, setSliderValue] = useState(42);
  const [checkboxStates, setCheckboxStates] = useState({
    option1: true,
    option2: false,
    option3: false,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                OutfAI
              </Link>
              <h1 className="text-2xl font-serif italic mt-1">
                Components Kit
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-acid-lime" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                V1.0
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Color Palette */}
        <Section title="Color Palette">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-foreground border border-border" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Bone White
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #F4F3EF
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-background border border-foreground" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Near Black
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #0A0A0A
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-signal-orange" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Signal Orange
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #FF4D00
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-acid-lime" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Acid Lime
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #B6FF00
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-electric-blue" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Electric Blue
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #0038FF
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-chrome-silver" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Chrome Silver
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #C9CCD6
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-secondary border border-border" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Secondary
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #1A1A1A
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-card border border-border" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Card
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                #111111
              </span>
            </div>
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                Display / Instrument Serif
              </span>
              <p className="text-5xl font-serif italic">Curated by AI</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                Heading / Inter
              </span>
              <p className="text-2xl font-medium tracking-tight">
                Style Redefined
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                Label / Inter Uppercase
              </span>
              <p className="text-xs uppercase tracking-widest">
                Collection Archive
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                Body / Inter
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                A curated selection of contemporary pieces, each chosen by our
                AI to complement your existing wardrobe and personal style
                preferences.
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                Micro / Inter
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                System Status Active
              </p>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                Variants
              </span>
              <div className="flex flex-wrap gap-4">
                <BrutalistButton variant="solid">Solid</BrutalistButton>
                <BrutalistButton variant="outline">Outline</BrutalistButton>
                <BrutalistButton variant="ghost">Ghost</BrutalistButton>
                <BrutalistButton variant="solid" disabled>
                  Disabled
                </BrutalistButton>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                Sizes
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <BrutalistButton size="sm">Small</BrutalistButton>
                <BrutalistButton size="md">Medium</BrutalistButton>
                <BrutalistButton size="lg">Large</BrutalistButton>
              </div>
            </div>
          </div>
        </Section>

        {/* Badges & Tags */}
        <Section title="Badges & Tags">
          <div className="space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                Badges
              </span>
              <div className="flex flex-wrap gap-3">
                <BrutalistBadge variant="default">Default</BrutalistBadge>
                <BrutalistBadge variant="orange">Orange</BrutalistBadge>
                <BrutalistBadge variant="lime">Lime</BrutalistBadge>
                <BrutalistBadge variant="blue">Blue</BrutalistBadge>
                <BrutalistBadge variant="outline">Outline</BrutalistBadge>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                Tags
              </span>
              <div className="flex flex-wrap gap-3">
                <Tag>Streetwear</Tag>
                <Tag>Avant-garde</Tag>
                <Tag variant="accent">New</Tag>
                <Tag>Minimalist</Tag>
              </div>
            </div>
          </div>
        </Section>

        {/* Form Elements */}
        <Section title="Form Elements">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <BrutalistInput label="Email" placeholder="Enter your email" />
              <BrutalistInput
                label="Password"
                type="password"
                placeholder="Enter password"
              />
              <BrutalistInput placeholder="No label variant" />
              <BrutalistInput
                label="Disabled"
                placeholder="Cannot edit"
                disabled
              />
            </div>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                  Toggle
                </span>
                <div className="space-y-3">
                  <BrutalistToggle
                    checked={toggleState}
                    onChange={setToggleState}
                    label="AI Recommendations"
                  />
                  <BrutalistToggle
                    checked={true}
                    onChange={() => {}}
                    label="Always On"
                  />
                  <BrutalistToggle
                    checked={false}
                    onChange={() => {}}
                    label="Disabled"
                    disabled
                  />
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                  Checkbox
                </span>
                <div className="space-y-3">
                  <BrutalistCheckbox
                    checked={checkboxStates.option1}
                    onChange={(v) =>
                      setCheckboxStates((s) => ({ ...s, option1: v }))
                    }
                    label="Include outerwear"
                  />
                  <BrutalistCheckbox
                    checked={checkboxStates.option2}
                    onChange={(v) =>
                      setCheckboxStates((s) => ({ ...s, option2: v }))
                    }
                    label="Include accessories"
                  />
                  <BrutalistCheckbox
                    checked={checkboxStates.option3}
                    onChange={(v) =>
                      setCheckboxStates((s) => ({ ...s, option3: v }))
                    }
                    label="Include footwear"
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Slider & Progress */}
        <Section title="Slider & Progress">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <BrutalistSlider
                value={sliderValue}
                onChange={setSliderValue}
                label="Style Intensity"
              />
              <BrutalistSlider value={75} label="Fixed Value" />
              <BrutalistSlider value={25} showValue={false} />
            </div>
            <div className="space-y-6">
              <BrutalistProgress value={75} label="Upload Progress" showValue />
              <BrutalistProgress
                value={45}
                variant="orange"
                label="Processing"
                showValue
              />
              <BrutalistProgress
                value={90}
                variant="lime"
                label="Complete"
                showValue
              />
            </div>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs">
          <div className="space-y-8">
            <BrutalistTabs
              tabs={[
                { id: "all", label: "All" },
                { id: "tops", label: "Tops" },
                { id: "bottoms", label: "Bottoms" },
                { id: "outerwear", label: "Outerwear" },
                { id: "accessories", label: "Accessories" },
              ]}
            />
            <div className="bg-card border border-border p-8">
              <p className="text-sm text-muted-foreground">Tab content area</p>
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid md:grid-cols-3 gap-6">
            <BrutalistCard variant="default">
              <BrutalistCardHeader>
                <BrutalistCardTitle>Default Card</BrutalistCardTitle>
              </BrutalistCardHeader>
              <BrutalistCardContent>
                Standard card with subtle border and dark background.
              </BrutalistCardContent>
            </BrutalistCard>
            <BrutalistCard variant="elevated">
              <BrutalistCardHeader>
                <BrutalistCardTitle>Elevated Card</BrutalistCardTitle>
              </BrutalistCardHeader>
              <BrutalistCardContent>
                Adds a hard shadow offset for depth.
              </BrutalistCardContent>
            </BrutalistCard>
            <BrutalistCard variant="outlined">
              <BrutalistCardHeader>
                <BrutalistCardTitle>Outlined Card</BrutalistCardTitle>
              </BrutalistCardHeader>
              <BrutalistCardContent>
                Bold border for emphasis.
              </BrutalistCardContent>
            </BrutalistCard>
          </div>
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <div className="space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                Sizes
              </span>
              <div className="flex items-center gap-4">
                <BrutalistAvatar size="sm" initials="SM" />
                <BrutalistAvatar size="md" initials="MD" />
                <BrutalistAvatar size="lg" initials="LG" />
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                With Status
              </span>
              <div className="flex items-center gap-4">
                <BrutalistAvatar initials="ON" status="online" />
                <BrutalistAvatar initials="AW" status="away" />
                <BrutalistAvatar initials="OF" status="offline" />
              </div>
            </div>
          </div>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip">
          <div className="flex flex-wrap gap-8">
            <BrutalistTooltip content="Top tooltip" position="top">
              <BrutalistButton variant="outline">
                Hover me (top)
              </BrutalistButton>
            </BrutalistTooltip>
            <BrutalistTooltip content="Bottom tooltip" position="bottom">
              <BrutalistButton variant="outline">
                Hover me (bottom)
              </BrutalistButton>
            </BrutalistTooltip>
            <BrutalistTooltip content="Left" position="left">
              <BrutalistButton variant="outline">Left</BrutalistButton>
            </BrutalistTooltip>
            <BrutalistTooltip content="Right" position="right">
              <BrutalistButton variant="outline">Right</BrutalistButton>
            </BrutalistTooltip>
          </div>
        </Section>

        {/* Divider */}
        <Section title="Divider">
          <div className="space-y-8">
            <BrutalistDivider />
            <BrutalistDivider label="Or continue with" />
          </div>
        </Section>

        {/* Spacing Reference */}
        <Section title="Spacing Reference">
          <div className="flex items-end gap-2">
            {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <div
                  className="bg-signal-orange"
                  style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                />
                <span className="text-[9px] font-mono text-muted-foreground">
                  {size}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              OutfAI Design System
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Cybersigilism / Neo-Brutalist
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
