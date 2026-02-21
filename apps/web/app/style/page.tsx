"use client";

import React, { useState } from "react";
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

export default function StyleDocPage() {
  const [toggleValue, setToggleValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] font-medium">
              OutfAI
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              /
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Style Doc
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            v1.0
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28 max-w-6xl mx-auto">
        {/* Hero */}
        <section className="mb-20">
          <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl mb-6 text-balance">
            Cybersigilism
            <br />
            <span className="text-signal-orange">Design System</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            A brutalist fashion-forward design language inspired by 2000s
            editorial aesthetics, cybersigilism, and neo-brutalist digital
            interfaces. Zero rounded corners. Maximum typographic tension.
          </p>
        </section>

        {/* Philosophy */}
        <section className="mb-20">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Philosophy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-2 border-signal-orange pl-6">
              <h3 className="text-sm uppercase tracking-widest font-medium mb-2">
                Sharp Edges
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zero border radius everywhere. No friendly curves. Every element
                cuts with precision.
              </p>
            </div>
            <div className="border-l-2 border-signal-orange pl-6">
              <h3 className="text-sm uppercase tracking-widest font-medium mb-2">
                Editorial Type
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Oversized serif italics for mood. Tight uppercase tracking for
                UI. Typographic hierarchy as architecture.
              </p>
            </div>
            <div className="border-l-2 border-signal-orange pl-6">
              <h3 className="text-sm uppercase tracking-widest font-medium mb-2">
                Restrained Color
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Signal orange used sparingly. Most UI in monochrome. Color as
                punctuation, not decoration.
              </p>
            </div>
          </div>
        </section>

        <BrutalistDivider />

        {/* Color Palette */}
        <section className="my-20">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Color Palette
          </h2>

          {/* Core Colors */}
          <div className="mb-12">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Core
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-24 bg-background border border-border mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Background
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  Light: #F4F3EF
                  <br />
                  Dark: #0A0A0A
                </p>
              </div>
              <div>
                <div className="h-24 bg-foreground border border-border mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Foreground
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  Light: #0A0A0A
                  <br />
                  Dark: #F4F3EF
                </p>
              </div>
              <div>
                <div className="h-24 bg-card border border-border mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Card
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  Light: #FFFFFF
                  <br />
                  Dark: #111111
                </p>
              </div>
              <div>
                <div className="h-24 bg-muted border border-border mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Muted
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  Light: #E8E7E3
                  <br />
                  Dark: #1A1A1A
                </p>
              </div>
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Accents
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-24 bg-signal-orange mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Signal Orange
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  #FF4D00
                </p>
              </div>
              <div>
                <div className="h-24 bg-acid-lime mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Acid Lime
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  Light: #7ACC00
                  <br />
                  Dark: #B6FF00
                </p>
              </div>
              <div>
                <div className="h-24 bg-electric-blue mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Electric Blue
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  #0038FF
                </p>
              </div>
              <div>
                <div className="h-24 bg-chrome-silver mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-medium">
                  Chrome Silver
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">
                  Light: #8A8A8A
                  <br />
                  Dark: #C9CCD6
                </p>
              </div>
            </div>
          </div>
        </section>

        <BrutalistDivider />

        {/* Typography */}
        <section className="my-20">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Typography
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Serif */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Display / Serif
              </p>
              <p className="font-serif italic text-5xl md:text-6xl mb-4">
                Instrument Serif
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Used for headlines, mood text, and editorial moments. Always
                italic. Creates tension against the sharp UI elements.
              </p>
              <div className="mt-6 space-y-2">
                <p className="font-serif italic text-4xl">Display Large</p>
                <p className="font-serif italic text-3xl">Display Medium</p>
                <p className="font-serif italic text-2xl">Display Small</p>
              </div>
            </div>

            {/* Sans */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                UI / Sans-Serif
              </p>
              <p className="text-5xl md:text-6xl font-medium mb-4">Inter</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Used for all UI elements, labels, and body text. Uppercase with
                wide letter-spacing for labels and buttons. Sentence case for
                body.
              </p>
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] font-medium">
                  Label / Tracking Wide
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em]">
                  Meta / Tracking Normal
                </p>
                <p className="text-sm leading-relaxed">
                  Body text uses sentence case with relaxed leading for
                  readability.
                </p>
              </div>
            </div>
          </div>
        </section>

        <BrutalistDivider />

        {/* Spacing */}
        <section className="my-20">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Spacing Scale
          </h2>

          <div className="flex flex-wrap gap-4 items-end">
            {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((size) => (
              <div key={size} className="flex flex-col items-center">
                <div
                  className="bg-signal-orange"
                  style={{ width: size, height: size }}
                />
                <p className="text-[9px] text-muted-foreground font-mono mt-2">
                  {size}px
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-8 max-w-lg">
            Spacing follows a 4px base grid. Common values: 4, 8, 12, 16, 24,
            32, 48, 64. Use gap utilities for consistent spacing between
            elements.
          </p>
        </section>

        <BrutalistDivider />

        {/* Components */}
        <section className="my-20">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Components
          </h2>

          {/* Buttons */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Buttons
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <BrutalistButton variant="solid">Solid</BrutalistButton>
              <BrutalistButton variant="outline">Outline</BrutalistButton>
              <BrutalistButton variant="ghost">Ghost</BrutalistButton>
              <BrutalistButton variant="solid" disabled>
                Disabled
              </BrutalistButton>
            </div>
            <div className="flex flex-wrap gap-4 items-center mt-4">
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
          </div>

          {/* Inputs */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Inputs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <BrutalistInput label="With Label" placeholder="Enter text" />
              <BrutalistInput placeholder="Without label" />
              <BrutalistInput
                label="Disabled"
                placeholder="Cannot edit"
                disabled
              />
            </div>
          </div>

          {/* Tags & Badges */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Tags & Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              <Tag>Default</Tag>
              <Tag variant="accent">Accent</Tag>
              <BrutalistBadge>Badge</BrutalistBadge>
              <BrutalistBadge variant="orange">Orange</BrutalistBadge>
              <BrutalistBadge variant="lime">Lime</BrutalistBadge>
              <BrutalistBadge variant="blue">Blue</BrutalistBadge>
            </div>
          </div>

          {/* Toggle & Checkbox */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Toggle & Checkbox
            </h3>
            <div className="flex flex-wrap gap-8 items-start">
              <BrutalistToggle
                label="Toggle Switch"
                checked={toggleValue}
                onChange={setToggleValue}
              />
              <BrutalistCheckbox
                label="Checkbox Option"
                checked={checkboxValue}
                onChange={setCheckboxValue}
              />
            </div>
          </div>

          {/* Slider & Progress */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Slider & Progress
            </h3>
            <div className="max-w-md space-y-8">
              <BrutalistSlider
                label="Slider"
                value={sliderValue}
                onChange={setSliderValue}
                showValue
              />
              <BrutalistProgress value={75} label="Progress" showValue />
              <BrutalistProgress value={45} variant="orange" />
            </div>
          </div>

          {/* Avatar */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Avatar
            </h3>
            <div className="flex flex-wrap gap-4 items-end">
              <BrutalistAvatar size="sm" initials="SM" />
              <BrutalistAvatar size="md" initials="MD" />
              <BrutalistAvatar size="lg" initials="LG" />
              <BrutalistAvatar size="md" initials="ON" status="online" />
              <BrutalistAvatar size="md" initials="OF" status="offline" />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Tabs
            </h3>
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
          </div>

          {/* Tooltip */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Tooltip
            </h3>
            <div className="flex flex-wrap gap-8">
              <BrutalistTooltip content="Top tooltip" position="top">
                <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help">
                  Hover (Top)
                </span>
              </BrutalistTooltip>
              <BrutalistTooltip content="Bottom tooltip" position="bottom">
                <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help">
                  Hover (Bottom)
                </span>
              </BrutalistTooltip>
              <BrutalistTooltip content="Left tooltip" position="left">
                <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help">
                  Hover (Left)
                </span>
              </BrutalistTooltip>
              <BrutalistTooltip content="Right tooltip" position="right">
                <span className="text-xs uppercase tracking-widest border-b border-dashed border-muted-foreground cursor-help">
                  Hover (Right)
                </span>
              </BrutalistTooltip>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BrutalistCard variant="default">
                <BrutalistCardHeader>
                  <BrutalistCardTitle>Default Card</BrutalistCardTitle>
                </BrutalistCardHeader>
                <BrutalistCardContent>
                  Standard card with subtle border. Use for most content
                  containers.
                </BrutalistCardContent>
              </BrutalistCard>
              <BrutalistCard variant="elevated">
                <BrutalistCardHeader>
                  <BrutalistCardTitle>Elevated Card</BrutalistCardTitle>
                </BrutalistCardHeader>
                <BrutalistCardContent>
                  Hard shadow for emphasis. Use sparingly for highlighted
                  content.
                </BrutalistCardContent>
              </BrutalistCard>
              <BrutalistCard variant="outlined">
                <BrutalistCardHeader>
                  <BrutalistCardTitle>Outlined Card</BrutalistCardTitle>
                </BrutalistCardHeader>
                <BrutalistCardContent>
                  Heavy border for maximum contrast. Use for interactive
                  selections.
                </BrutalistCardContent>
              </BrutalistCard>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-16">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Divider
            </h3>
            <div className="space-y-6">
              <BrutalistDivider />
              <BrutalistDivider label="With Label" />
            </div>
          </div>
        </section>

        <BrutalistDivider />

        {/* Usage Guidelines */}
        <section className="my-20">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Usage Guidelines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm uppercase tracking-widest font-medium mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-acid-lime" />
                Do
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Use signal orange for primary actions and highlights only
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Maintain uppercase tracking on all labels and navigation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Keep interactions fast (100ms transitions max)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Use serif italic for editorial/emotional moments
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Leave generous whitespace between sections
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest font-medium mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-signal-orange" />
                {"Don't"}
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Never use rounded corners on any element
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Avoid soft shadows or blur effects
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  {"Don't use gradients (solid colors only)"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  {"Don't mix more than 2 accent colors per screen"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-1">-</span>
                  Avoid bouncy or playful animations
                </li>
              </ul>
            </div>
          </div>
        </section>

        <BrutalistDivider />

        {/* Footer */}
        <section className="my-20">
          <p className="font-serif italic text-2xl md:text-3xl text-muted-foreground">
            {'"Fashion is architecture: it is a matter of proportions."'}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-4">
            — Coco Chanel
          </p>
        </section>
      </div>
    </main>
  );
}
