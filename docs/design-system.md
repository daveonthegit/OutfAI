# Design System

Purpose

Describe the current UI direction, where the live style reference lives, and what implementation constraints matter when changing the frontend.

Read this when

- You are changing shared UI or route-level styling.
- You need the design intent behind the current visual system.

Current state

OutfAI uses an editorial, wardrobe-first UI with a light-first presentation, an elegant dark-mode inversion, rounded product surfaces, and a restrained accent palette. Wardrobe imagery and outfit context should stay visually dominant over interface chrome.

The active consolidation plan lives in [ui-ux-audit-plan.md](ui-ux-audit-plan.md). Treat that file as the task-level plan for retiring duplicate primitives, normalizing loading/empty states, and tightening accessibility.

Design direction

- Brand personality: precise, edgy, considered
- Primary mode: light
- Visual character: rounded editorial SaaS, high-contrast typography, restrained accent usage
- Reference balance: premium fashion editorial plus practical personal-stylist product utility

Typography

- Sans/UI text: Hanken Grotesk
- Display serif: Bodoni Moda, used with italic display styling

Color and interaction principles

- Signal orange is used sparingly
- Cards, buttons, inputs, and navigation share `--marketing-radius-apple` unless a legacy primitive has not yet migrated
- Light and dark modes should keep the same layout and hierarchy; avoid sudden dark/light section swaps inside a page
- Motion should communicate state changes, not add decorative noise
- UI should feel fast, restrained, and content-first

Live reference

- Style route: `apps/web/app/style/page.tsx`
- In-app reference route: `/style`

Implementation rules

- Reuse existing components before inventing new patterns
- Prefer design tokens over arbitrary colors or spacing
- Prefer the existing `brutalist-*` primitives for app surfaces while treating them as the current rounded editorial product primitives; keep shadcn `ui/*` primitives as lower-level infrastructure unless a migration task says otherwise
- Keep styling aligned with `rules/styling-patterns.mdc`
- Update the style page when introducing shared UI primitives or tokens

Related docs

- [architecture.md](architecture.md)
- [contributing.md](contributing.md)
- [ui-ux-audit-plan.md](ui-ux-audit-plan.md)
