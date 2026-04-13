# Design System

Purpose

Describe the current UI direction, where the live style reference lives, and what implementation constraints matter when changing the frontend.

Read this when

- You are changing shared UI or route-level styling.
- You need the design intent behind the current visual system.

Current state

OutfAI uses a sharp, editorial, wardrobe-first UI with a light-first presentation and a restrained accent palette. The wardrobe content should stay visually dominant over interface chrome.

Design direction

- Brand personality: precise, edgy, considered
- Primary mode: light
- Visual character: zero-radius, high-contrast, typography-led, restrained accent usage
- Reference balance: premium editorial fashion plus design-tool discipline

Typography

- Sans/UI text: Hanken Grotesk
- Display serif: Bodoni Moda, used with italic display styling

Color and interaction principles

- Signal orange is used sparingly
- Zero border radius remains the default
- Motion should communicate state changes, not add decorative noise
- UI should feel fast, restrained, and content-first

Live reference

- Style route: `apps/web/app/style/page.tsx`
- In-app reference route: `/style`

Implementation rules

- Reuse existing components before inventing new patterns
- Prefer design tokens over arbitrary colors or spacing
- Keep styling aligned with `rules/styling-patterns.mdc`
- Update the style page when introducing shared UI primitives or tokens

Related docs

- [architecture.md](architecture.md)
- [contributing.md](contributing.md)
