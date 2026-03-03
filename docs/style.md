# OutfAI — Style & Design System

**Single source of truth for visual and interaction patterns.**

## Where to look

- **Live reference (app):** Route **`/style`** — run the web app (`apps/web`) and open `/style` in the browser to see the full, interactive style documentation.
- **Source (for edits):** [`apps/web/app/style/page.tsx`](../apps/web/app/style/page.tsx)

Agents and contributors should use the **style page** as the canonical reference when implementing or changing UI. The page documents the OutfAI design system and shows live examples of every component and token.

## What it covers

The style page is the **Cybersigilism Style Reference** (OutfAI Design System v1.0). It defines:

| Section           | Contents                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Philosophy**    | Sharp edges (no border radius), editorial typography, restrained color                  |
| **Color Palette** | Core tokens (`--background`, `--foreground`, `--card`, etc.), signal orange, light/dark |
| **Typography**    | Serif italics, uppercase tracking, hierarchy                                            |
| **Spacing**       | Scale and usage                                                                         |
| **Iconography**   | Icon style and usage                                                                    |
| **Buttons**       | `BrutalistButton` and variants                                                          |
| **Inputs**        | `BrutalistInput` and form patterns                                                      |
| **Tags & Badges** | `Tag`, `BrutalistBadge`                                                                 |
| **Controls**      | Toggle, checkbox, slider, tabs                                                          |
| **Feedback**      | Progress, tooltips                                                                      |
| **Cards**         | `BrutalistCard` and structure                                                           |
| **Navigation**    | Bottom nav, links                                                                       |
| **Avatars**       | `BrutalistAvatar`                                                                       |
| **Misc**          | Dividers and utilities                                                                  |
| **Motion**        | Animation and transition rules                                                          |
| **Guidelines**    | Do’s and don’ts                                                                         |

Design language: **brutalist, fashion-forward, 2000s editorial, cybersigilism.** Zero rounded corners; typography and color used with clear intent.

## For agents

When changing UI in `apps/web`:

1. **Read the style page** (or this doc) so decisions match the system.
2. **Reuse existing components** from `@/components` (e.g. `BrutalistButton`, `BrutalistCard`, `BrutalistInput`) instead of introducing new patterns.
3. **Use design tokens** from the palette (e.g. `bg-background`, `text-foreground`, `border-border`, `text-signal-orange`) rather than arbitrary colors.
4. **Keep `border-radius: 0`** unless the style page explicitly allows otherwise.
5. **Update the style page** in `apps/web/app/style/page.tsx` when adding new shared components or tokens so the reference stays accurate.
