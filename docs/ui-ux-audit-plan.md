# OutfAI UI/UX Audit & Implementation Plan

---

## 1. Executive Summary

OutfAI has a strong, opinionated visual identity — **Cybersigilism** (zero-radius, bone-white + near-black, signal-orange accent, Hanken Grotesk body + Bodoni Moda italic display). The identity is holding. What is **not** holding is the **system underneath it**: two parallel button libraries (`brutalist-*` and shadcn `ui/*`) coexist without a canonical choice, cards render at three different padding values, modals split between Radix Dialog and hand-rolled overlays (the outfit detail overlay has no focus trap), and arbitrary type sizes (`text-[10px]`, `text-[11px]`, `text-[13px]`) live alongside the Tailwind scale.

This plan **does not redesign** OutfAI. It consolidates, freezes tokens, promotes `brutalist-*` to the canonical library, retires duplicates, and fixes the highest-friction screens (Outfit detail, Closet card, Add Garment upload). Work is structured as **5 sequential stages → 22 atomic tasks → 22 GitHub issues**, scoped so a lower-level coding model can execute one at a time with minimal judgment.

---

## 2. UI/UX Audit Findings

### 2.1 Visual consistency

| #   | Issue                                                                                                          | Severity   | Location                                                                     | Why it matters                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| V1  | Two button systems coexist (`components/brutalist-button.tsx` + `components/ui/button.tsx`)                    | **High**   | Codebase-wide                                                                | No canonical choice; pages mix both plus inline `className` buttons. Every new screen re-litigates the decision. |
| V2  | `brutalist-button.tsx` still contains `rounded-sm`                                                             | **High**   | `apps/web/components/brutalist-button.tsx`                                   | Violates the zero-radius rule that defines the identity.                                                         |
| V3  | Card padding varies: `p-4`, `p-6`, and no padding wrapper                                                      | **High**   | `closet/page.tsx`, `archive/page.tsx`, `plan/page.tsx`, `brutalist-card.tsx` | Inconsistent rhythm; cards feel unrelated across screens.                                                        |
| V4  | Arbitrary type sizes (`text-[10px]`, `text-[11px]`, `text-[13px]`) mixed with Tailwind scale                   | **Medium** | Throughout pages                                                             | Prevents a clean typographic scale; micro-sizes drift screen-by-screen.                                          |
| V5  | Display sizes mixed (`text-2xl`…`text-7xl`) without tier system                                                | **Medium** | Home hero, Style, Explain, Login aside                                       | Headline hierarchy is improvised per page.                                                                       |
| V6  | Border treatments mixed (`border`, `border-2`, `border-border`, inline `border-black/10`, `border-l border-t`) | **Medium** | Outfit overlay, misc cards                                                   | Breaks the engineered 1px line language.                                                                         |
| V7  | Glass effect duplicated as inline classes (`glass-bar`, `glass-panel`, `glass-veil`) with no wrapper           | **Low**    | Onboarding, Profile, layout                                                  | Works, but copy-paste risks drift on any future tweak.                                                           |
| V8  | Arbitrary spacing values (`mb-10 md:mb-14`, `gap-12 lg:gap-16`) next to scale values                           | **Low**    | FilterBar, Archive grid                                                      | Hard to keep page rhythm consistent.                                                                             |

### 2.2 Interaction consistency

| #   | Issue                                                                                                                      | Severity   | Location                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| I1  | Outfit detail modal is a hand-rolled `<div>` overlay — no focus trap, no Escape, no aria role                              | **High**   | `outfit/page.tsx`                                           |
| I2  | Closet detail uses Radix `Dialog`; Outfit detail uses custom div; Archive "I wore this" uses always-visible inline buttons | **High**   | Closet/Outfit/Archive — three modal models for the same job |
| I3  | Clickable `<div>` elements with keyboard handlers instead of semantic `<button>`                                           | **Medium** | Outfit recommendation card, archive card, closet tile       |
| I4  | Loading states split between `Skeleton` grid and plain `Loading…` text                                                     | **Medium** | Closet (skeleton) vs Outfit/Archive (text)                  |
| I5  | Empty states split between structured card + CTA and plain text + link                                                     | **Medium** | Archive (structured) vs Outfit/Closet (text)                |
| I6  | Add Garment has no upload-progress or analyze-progress indicator                                                           | **Medium** | `add/page.tsx`                                              |
| I7  | Toasts used for some actions (save), not others (analyze failure handled inline)                                           | **Low**    | Add, Recommendation card                                    |

### 2.3 UX flow quality

| #   | Issue                                                                                                                         | Severity   | Location                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------- |
| F1  | Onboarding "add garments" step sends user to `/add`; returning loses the onboarding step state                                | **High**   | `onboarding/page.tsx`            |
| F2  | Outfit detail has a weak primary — Save, See why, and close all compete visually                                              | **Medium** | `outfit/page.tsx`                |
| F3  | Plan hub is a 2-card nav page with no data preview (upcoming outfit / next packing list)                                      | **Medium** | `plan/page.tsx`                  |
| F4  | Archive card hover reveals "Click to view" while "I wore this" and "Remove" are always visible — competing primaries per card | **Medium** | `archive/page.tsx`               |
| F5  | Mood page is a redirect to `/?openMood=1` — orphaned route with no independent UI                                             | **Low**    | `mood/page.tsx`                  |
| F6  | Kit page and Style page are two separate living-docs surfaces                                                                 | **Low**    | `kit/page.tsx`, `style/page.tsx` |

---

## 3. Design Direction

**Keep**

- Cybersigilism identity: zero radius, bone-white / near-black, signal orange `#ff4d00` as scarcity accent, Hanken Grotesk body + Bodoni Moda italic display.
- `brutalist-*` component naming and visual voice.
- Glass-bar top header + bottom nav on mobile, sidebar on desktop.
- Radix primitives under the hood for Dialog/Popover/Tooltip.

**Standardize**

- One canonical button: `BrutalistButton`. Retire `components/ui/button.tsx`.
- One canonical card: `BrutalistCard` with `density` prop (`compact | default`). All page-level cards use it.
- One canonical modal wrapper: `BrutalistDialog` built on Radix.
- One `EmptyState` + one `LoadingState` component reused on every screen.
- A **frozen** typographic scale (5 tiers) and **frozen** spacing scale.

**Simplify**

- Remove `rounded-sm` from `BrutalistButton`.
- Remove arbitrary `text-[10px]`, `text-[11px]`, `text-[13px]` — all resolve to scale tiers.
- Collapse custom overlay in `outfit/page.tsx` onto `BrutalistDialog`.

**Remove**

- `components/ui/button.tsx` (after migration).
- `/mood` redirect route — open mood modal from home link directly.
- Duplicate skeletons / ad-hoc `Loading…` strings.

**Consolidate**

- Glass classes behind `<GlassPanel>` / `<GlassBar>` wrappers.
- `Kit` and `Style` pages into one `/style` living-docs route with tabbed sections.

**Principles the lower-level model must follow**

1. Primary actions are always solid `BrutalistButton`; secondary are outline; tertiary are ghost. One primary per surface.
2. Every page uses `PageContainer` + `SectionHeader`. No bespoke page shells.
3. Every card uses `BrutalistCard`. No inline `border + bg-card` combinations.
4. Every modal uses `BrutalistDialog`. No hand-rolled div overlays.
5. Signal orange appears ≤2 times per visible surface and only on interactive hints / hover / active nav / destructive confirm.
6. Typography uses the 5-tier scale only. No arbitrary `text-[Npx]`.
7. Spacing uses the 8-step scale only. No arbitrary `mb-[Npx]` / `gap-[Npx]`.

---

## 4. Design System Rules

### 4.1 Tokens (freeze these)

**Typography scale** (enforce via utility classes or component variants):

| Tier         | Use                                | Value                                                                  |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| `display-xl` | Hero only (login aside, marketing) | `font-serif italic text-5xl md:text-7xl leading-[0.95] tracking-tight` |
| `display-lg` | Page titles                        | `font-serif italic text-3xl md:text-4xl leading-tight`                 |
| `display-md` | Section headers                    | `font-serif italic text-2xl leading-tight`                             |
| `body`       | Paragraph / UI text                | `font-sans text-sm leading-relaxed`                                    |
| `label`      | Eyebrows, meta, nav                | `font-sans text-xs uppercase tracking-[0.2em]`                         |

No other sizes are allowed in app pages (`style/page.tsx` doc page exempted).

**Spacing scale** (all page-level margins/paddings): `2, 3, 4, 6, 8, 10, 12, 16` (Tailwind units). Remove `mb-14`, `gap-12`, etc.

**Radius scale**: `0` only. `--radius-sm/md/lg/xl` all remain `0`.

**Elevation**

- `flat` — default; no shadow; 1px border-border.
- `raised` — hover/focus on interactive cards; 1px border-foreground, no shadow.
- `glass` — `glass-panel` utility, used only on modals and onboarding panels.

**Color roles**

- `background` / `foreground` — surface + ink.
- `card` — card surface (white light / `#111` dark).
- `border` — 1px divider default.
- `muted-foreground` — secondary text only.
- `signal-orange` — interactive accent (hover hint, active nav, destructive confirm). **Budget: ≤2 instances per visible surface.**
- `acid-lime`, `electric-blue`, `chrome-silver` — reserved for score/data categorization only (explain page dots, chart-1..5).

**Semantic states**: `hover`, `focus-visible` (orange ring), `active` (`translate-y-px`), `disabled` (`opacity-50 cursor-not-allowed`), `loading` (replace label with `<LoadingState size="sm" />`).

### 4.2 Shared component spec

**BrutalistButton**

- Variants: `solid | outline | ghost | destructive`. Sizes: `sm | md | lg`.
- `solid` = primary (one per surface). `outline` = secondary. `ghost` = tertiary/table-row. `destructive` = confirm delete only.
- Always has `focus-visible` orange ring; `active:translate-y-px`; `disabled:opacity-50`.
- Anti-patterns: no inline-styled buttons; no `<a>` styled as button without `asChild`.

**BrutalistCard**

- Variants: `default | elevated | outlined`. Density: `compact (p-4) | default (p-6)`.
- Subcomponents: `Header` (border-b pb-4 mb-4), `Title` (label tier), `Content` (body tier).
- Anti-patterns: no padding applied by parent; no arbitrary border widths.

**BrutalistInput / Textarea / Select**

- Optional label above (label tier). `border-border`, focus-visible ring (60% orange), `placeholder` in label tier.
- One input style only; size via parent layout.

**Tag / Chip**

- Variants: `default | active | removable`. Height 28px. Uppercase label tier.
- Used for: occasions, moods, styles, filters.

**BrutalistBadge**

- Variants: `default | orange | lime | blue | outline`. Sizes: `sm | md`.
- Used for: status, count, category signal. Never interactive.

**BrutalistDialog**

- Built on Radix `Dialog`. Slots: `Trigger`, `Content`, `Header`, `Title`, `Description`, `Footer`.
- Always: focus trap, Escape-to-close, 16px backdrop veil (`glass-veil`), zero radius.
- Two sizes: `md (max-w-md)`, `lg (max-w-2xl)`.
- Anti-patterns: no hand-rolled overlays anywhere.

**BrutalistTabs**

- Underline tabs only. Uppercase labels. Active: 2px bottom border-foreground. No pill tabs.

**TopBar / BottomNav / Sidebar**

- Glass-bar material. TopBar sticky. BottomNav `<lg`. Sidebar `lg+`.
- One active color: `signal-orange` text. No active background fill.

**SectionHeader**

- Props: `title`, `subtitle?`, `action?`. Title uses `display-md`. Subtitle uses `body text-muted-foreground`. Action slot on the right.

**EmptyState**

- Props: `title`, `description`, `action?`, `icon?`. Centered. 120–160px tall minimum. Action is outline button.

**LoadingState**

- Three modes: `skeleton` (block grid), `spinner` (inline mark), `shimmer` (card-sized shimmer). Picked via prop; no raw "Loading…" text anywhere.

**ErrorState**

- Card variant with label "Something broke", body paragraph, `Retry` outline button.

---

## 5. Screen-by-Screen Recommendations

### 5.1 Home — Authenticated (`app/page.tsx` + `components/home/*`)

- **Working**: Hero greeting, recommendation grid concept, mood toolbar.
- **Inconsistent**: Recommendation card has competing CTAs (Save, Skip, See why, Click to view, keyboard hints all visible).
- **Change**: One primary per card (Save). Skip = outline. "See why" collapses into a chevron-only button that opens explain drawer. Keyboard hints fade in only on hover/focus.
- **Components**: `BrutalistCard`, `BrutalistButton`, `BrutalistDialog` (for See why sheet).
- **Hierarchy**: Hero → Toolbar → Recommendation grid → Footer actions.
- **Priority**: High.

### 5.2 Closet (`app/closet/page.tsx`)

- **Working**: Filter bar, skeleton grid, Radix Dialog for detail.
- **Inconsistent**: Garment cards are inline `border bg-card` (not `BrutalistCard`). Select toggle is inline-styled.
- **Change**: Move tile to `<ClosetTile>` using `BrutalistCard density="compact"`. Select toggle uses `BrutalistButton variant="outline"`.
- **Components**: `BrutalistCard`, `FilterBar`, `BrutalistDialog`, `EmptyState`.
- **Priority**: High.

### 5.3 Outfit detail (`app/outfit/page.tsx`)

- **Working**: Editorial layout, explanation section.
- **Inconsistent**: Custom `<div>` overlay, no focus trap. Save action visually equal to metadata.
- **Change**: Replace overlay with `BrutalistDialog size="lg"`. Save becomes solid primary, top-right sticky. Swap `Loading…` text for `<LoadingState mode="shimmer">`.
- **Components**: `BrutalistDialog`, `BrutalistButton`, `LoadingState`, `SectionHeader`.
- **Priority**: High.

### 5.4 Add Garment (`app/add/page.tsx`)

- **Working**: Split-pane layout, Convex save mutation.
- **Inconsistent**: Two-click upload→analyze flow; no progress UI; tag input ergonomics.
- **Change**: Single-click upload auto-triggers analyze with inline progress bar (`BrutalistProgress`). Manual fields appear populated. Keep Save as single primary at bottom.
- **Components**: `SplitPane`, `BrutalistInput`, `Tag`, `BrutalistProgress`, `BrutalistButton`.
- **Priority**: Medium.

### 5.5 Archive (`app/archive/page.tsx`)

- **Working**: Time grouping, filter bar.
- **Inconsistent**: "I wore this" + "Remove" always visible; click-to-view is hover-hint only.
- **Change**: Move "I wore this" + "Remove" into a `BrutalistDropdown` (⋯ menu) on card. Card click = primary view action. Replace `Loading…` with skeleton grid.
- **Components**: `BrutalistCard density="compact"`, `FilterBar`, `BrutalistDropdown`, `LoadingState`, `EmptyState`.
- **Priority**: Medium.

### 5.6 Plan Hub (`app/plan/page.tsx`)

- **Working**: Clean card nav.
- **Change**: Add a live preview band above the 2 cards: "Next: Friday — Dinner look (3 items)" + "Next trip: Lisbon, 7d, packing 68%". Cards stay; preview gives the hub purpose.
- **Components**: `SectionHeader`, `BrutalistCard`, `BrutalistProgress`.
- **Priority**: Low (post-polish).

### 5.7 Calendar (`app/plan/calendar/*`)

- **Change**: `assign-outfit-panel` → `BrutalistDialog size="lg"`. Day cell uses `BrutalistCard density="compact"`. Keep month grid as-is.
- **Priority**: Medium.

### 5.8 Onboarding (`app/onboarding/page.tsx`)

- **Working**: 5-step wizard, glass panels.
- **Inconsistent**: Step 2 `/add` departure loses state.
- **Change**: Embed `AddGarmentSheet` (same form as `/add` but in `BrutalistDialog size="lg"`) directly in step 2. Progress persists. Add Back button from step 2 onward.
- **Components**: `BrutalistDialog`, `BrutalistProgress`, `GlassPanel`.
- **Priority**: High.

### 5.9 Profile (`app/profile/page.tsx`)

- **Working**: Avatar, stats, settings link.
- **Change**: Migrate form to `BrutalistInput`. Stats sections use `BrutalistCard density="compact"` grid. Edit/Cancel/Save are buttons with correct hierarchy (solid Save, outline Cancel, ghost Edit).
- **Priority**: Medium.

### 5.10 Auth (Login, Signup, Forgot, Reset, Verify, Check-email)

- **Working**: `AuthEditorialShell` with serif aside.
- **Change**: Consolidate all five screens on the same shell + same form spec. One password-reveal icon component. Resend-verification block is a reusable sub-component.
- **Priority**: Low (already consistent enough).

### 5.11 Style + Kit living docs

- **Change**: Merge `/kit` into `/style` under a "Components" tab. One canonical reference surface.
- **Priority**: Low.

### 5.12 Mood (`app/mood/page.tsx`)

- **Change**: Delete the route. Link to mood opens the modal via client state — no `?openMood=1` query param.
- **Priority**: Low.

### 5.13 Explain (`app/explain/page.tsx`)

- **Working**: Editorial spread.
- **Change**: Replace colored dots with `BrutalistBadge` (orange/lime/blue) for tag consistency. Editor's Notes list uses `SectionHeader`.
- **Priority**: Low.

---

## 6. Refactor Stages

### Stage 1 — Design system foundation

- **Goal**: Freeze tokens and add missing primitives.
- **Scope**: `globals.css` token audit, add `typography.css` utilities for the 5 tiers, add `<EmptyState>`, `<LoadingState>`, `<ErrorState>`, `<BrutalistDialog>`, `<GlassPanel>`, `<GlassBar>`, `<BrutalistDropdown>`.
- **Dependencies**: None.
- **Risks**: Token changes cascade; do a visual diff pass on Style/Kit.
- **DoD**: All new primitives exist in `components/`, exported, documented in `/style`. No app-page import changes yet.

### Stage 2 — Shared component refactor

- **Goal**: Make `brutalist-*` canonical; retire duplicates.
- **Scope**: Remove `rounded-sm` from `BrutalistButton`; add `destructive` variant; add `density` prop to `BrutalistCard`; delete `components/ui/button.tsx` after replacing imports.
- **Dependencies**: Stage 1.
- **Risks**: Any screen still using `ui/button` breaks — find/replace must be complete.
- **DoD**: Grep for `components/ui/button` returns zero results; `BrutalistButton` used everywhere.

### Stage 3 — Layout normalization

- **Goal**: Every page uses `PageContainer` + `SectionHeader`; all cards use `BrutalistCard`.
- **Scope**: Closet tiles, Archive tiles, Plan cards, Profile stats, Home recommendation cards.
- **Dependencies**: Stage 2.
- **Risks**: Visual regressions on density-sensitive pages (Closet grid).
- **DoD**: No inline `border border-border bg-card` combinations remain.

### Stage 4 — Screen-specific cleanup

- **Goal**: Fix the high-friction screens.
- **Scope**: Outfit detail overlay → `BrutalistDialog`; Onboarding step 2 embed; Add Garment progress UI; Archive dropdown menu; `/mood` deletion; `/kit` merge into `/style`.
- **Dependencies**: Stage 3.
- **Risks**: Onboarding state management must persist across modal open/close.
- **DoD**: All modals accessible (focus trap, Escape, aria); no hand-rolled overlays.

### Stage 5 — Interaction & state polish

- **Goal**: Unify loading/empty/error states + focus states.
- **Scope**: Replace every `Loading…` string with `LoadingState`; replace every empty text block with `EmptyState`; convert clickable `<div>`s to `<button>`s; audit signal-orange budget per surface.
- **Dependencies**: Stage 4.
- **DoD**: Zero raw "Loading…" strings. Zero `div role="button"`. Signal-orange audit ≤ 2 per surface.

---

## 7. Atomic Implementation Tasks

| #   | Task                                                            | Goal                                                                                  | Files                                          | Rules                                                               | Deps | Acceptance                                                                 |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| T1  | Freeze token documentation                                      | Add typography-tier utilities (`.text-display-xl/lg/md`, `.text-body`, `.text-label`) | `globals.css`, `style/page.tsx`                | 5 tiers only; no arbitrary px                                       | —    | `.text-display-md` renders Bodoni italic 2xl; style page shows all 5 tiers |
| T2  | Remove `rounded-sm` from `BrutalistButton`                      | Align with zero-radius rule                                                           | `brutalist-button.tsx`                         | Zero-radius                                                         | —    | No `rounded-*` class in component                                          |
| T3  | Add `destructive` variant to `BrutalistButton`                  | Replace inline `bg-destructive` usages                                                | `brutalist-button.tsx`                         | Hover orange, solid text                                            | T2   | Variant renders; used in delete-confirm dialog                             |
| T4  | Add `density` prop to `BrutalistCard`                           | Support compact tiles (p-4)                                                           | `brutalist-card.tsx`                           | `compact=p-4`, `default=p-6`                                        | —    | Both densities render; visual diff in /style                               |
| T5  | Create `<BrutalistDialog>` wrapper                              | Unified modal on Radix                                                                | new `components/brutalist-dialog.tsx`          | Focus trap, Escape, zero radius, `glass-veil` backdrop, sizes md/lg | T1   | Exports Trigger/Content/Header/Title/Footer slots                          |
| T6  | Create `<LoadingState>`                                         | One loading primitive                                                                 | new `components/loading-state.tsx`             | Modes: skeleton/spinner/shimmer                                     | T1   | All modes render in /style                                                 |
| T7  | Create `<EmptyState>`                                           | One empty primitive                                                                   | new `components/empty-state.tsx`               | Title/desc/action                                                   | T1   | Renders in /style                                                          |
| T8  | Create `<ErrorState>`                                           | One error primitive                                                                   | new `components/error-state.tsx`               | Retry action                                                        | T1   | Renders in /style                                                          |
| T9  | Create `<GlassPanel>` / `<GlassBar>`                            | Wrap existing CSS utilities                                                           | new `components/layout/glass.tsx`              | No new CSS                                                          | —    | Replaces inline `className="glass-panel"` callsites                        |
| T10 | Migrate all `components/ui/button` imports to `BrutalistButton` | Retire duplicate                                                                      | grep-and-replace                               | Size+variant map                                                    | T3   | Grep `ui/button` = 0 results                                               |
| T11 | Delete `components/ui/button.tsx`                               | Remove duplicate                                                                      | `ui/button.tsx`                                | —                                                                   | T10  | File gone; build passes                                                    |
| T12 | Closet tiles → `BrutalistCard density="compact"`                | Unify card model                                                                      | `closet/page.tsx`                              | No inline border classes                                            | T4   | Tiles use component; padding p-4                                           |
| T13 | Archive tiles → `BrutalistCard density="compact"`               | Unify card model                                                                      | `archive/page.tsx`                             | Dropdown menu for "Wore"/"Remove"                                   | T4   | One primary per tile                                                       |
| T14 | Plan hub cards → `BrutalistCard default` + preview band         | Give hub a purpose                                                                    | `plan/page.tsx`                                | `SectionHeader` above                                               | T4   | Shows next outfit + packing %                                              |
| T15 | Replace Outfit detail overlay with `BrutalistDialog size="lg"`  | Accessibility + consistency                                                           | `outfit/page.tsx`                              | Focus trap, Escape, solid-primary Save                              | T5   | Keyboard-only flow works                                                   |
| T16 | Onboarding step 2: embed Add-Garment form in dialog             | Persist onboarding state                                                              | `onboarding/page.tsx`, reuse Add form          | No navigation away                                                  | T5   | Count increments without losing step                                       |
| T17 | Add Garment: single-click analyze + progress                    | Reduce friction                                                                       | `add/page.tsx`                                 | `BrutalistProgress` inline                                          | —    | One click goes from drop → fields populated                                |
| T18 | Replace all `Loading…` strings with `<LoadingState>`            | Unified loading                                                                       | `outfit/page.tsx`, `archive/page.tsx`, others  | Mode per context                                                    | T6   | Grep `"Loading…"` = 0                                                      |
| T19 | Replace empty text blocks with `<EmptyState>`                   | Unified empty                                                                         | Closet, Outfit, Archive                        | Include CTA                                                         | T7   | All empties use component                                                  |
| T20 | Convert clickable `<div>`s to `<button>`                        | a11y + focus ring shape                                                               | Recommendation card, archive card, closet tile | Keep visual identical                                               | T1   | Zero `role="button"` in JSX                                                |
| T21 | Delete `/mood` route; wire modal from home link                 | Remove orphan route                                                                   | `mood/page.tsx`, home nav                      | Modal controlled by client state                                    | —    | `/mood` 404; link opens modal                                              |
| T22 | Merge `/kit` sections into `/style` under a Components tab      | One docs surface                                                                      | `kit/page.tsx` → `style/page.tsx`              | `BrutalistTabs`                                                     | —    | `/kit` 404; `/style` has tab                                               |

---

## 8. Lower-Level Model Guardrails

The implementing model **must**:

1. Never invent new design patterns. If a need isn't covered by the spec in §4, stop and ask.
2. Never introduce new spacing, font-size, or radius values. Only the frozen scale.
3. Reuse the canonical components (`BrutalistButton`, `BrutalistCard`, `BrutalistDialog`, `EmptyState`, `LoadingState`, `ErrorState`, `GlassPanel`, `GlassBar`, `SectionHeader`, `PageContainer`, `FilterBar`, `Tag`, `BrutalistBadge`, `BrutalistInput`, `BrutalistTabs`) before writing markup.
4. Never ship a hand-rolled modal overlay. All modals go through `BrutalistDialog`.
5. Preserve existing behavior (data-fetching, mutations, routing) unless the task description explicitly changes it.
6. Prefer **minimum diff for maximum consistency**. No incidental refactors.
7. Never add gradient text, side-stripe borders, non-zero radii, or decorative drop shadows on app screens.
8. Keep the signal-orange budget: ≤2 orange elements visible per surface.
9. Italic is mandatory on `font-serif`. No upright serif on app screens.
10. Icons: inline SVG, 24×24 viewBox, 1.5px stroke, `currentColor`. Do not import `lucide-react` on new components unless an existing neighbor already uses it.
11. Before completing a task, run the visual-diff check in `/style` (which renders every primitive) and confirm no regression.
12. Each task commit must match one issue from §9. Do not bundle.

---

## 9. GitHub Issues

---

**Issue 1 — Freeze typography tiers in globals.css and /style**
Type: Design System · Priority: High · Deps: none
Description: Introduce 5 typography utility classes (`display-xl`, `display-lg`, `display-md`, `body`, `label`) in `globals.css`. Add a "Typography" section to `/style` that renders all five.
Scope: `apps/web/app/globals.css`, `apps/web/app/style/page.tsx`.
Acceptance: All five classes render; no app-page changes in this issue.

---

**Issue 2 — Remove `rounded-sm` from BrutalistButton**
Type: Design System · Priority: High · Deps: none
Scope: `apps/web/components/brutalist-button.tsx`.
Acceptance: No `rounded-*` class remains. Style page button row unchanged except for sharper corners.

---

**Issue 3 — Add `destructive` variant to BrutalistButton**
Type: Design System · Priority: Medium · Deps: #2
Scope: `brutalist-button.tsx`, `/style`.
Acceptance: `variant="destructive"` renders with orange hover; variant shown in /style.

---

**Issue 4 — Add `density` prop to BrutalistCard (`compact | default`)**
Type: Design System · Priority: High · Deps: none
Scope: `brutalist-card.tsx`, `/style`.
Acceptance: `density="compact"` applies p-4; default p-6.

---

**Issue 5 — Create BrutalistDialog wrapper on Radix**
Type: Design System · Priority: High · Deps: #1
Scope: new `components/brutalist-dialog.tsx`, `/style`.
Acceptance: Slots Trigger/Content/Header/Title/Description/Footer; sizes md/lg; focus trap + Escape; glass-veil backdrop.

---

**Issue 6 — Create LoadingState primitive (skeleton/spinner/shimmer)**
Type: Design System · Priority: High · Deps: #1
Scope: new `components/loading-state.tsx`.
Acceptance: All three modes render in /style.

---

**Issue 7 — Create EmptyState primitive**
Type: Design System · Priority: High · Deps: #1
Scope: new `components/empty-state.tsx`.
Acceptance: Props title/description/action; rendered in /style.

---

**Issue 8 — Create ErrorState primitive**
Type: Design System · Priority: Medium · Deps: #1
Scope: new `components/error-state.tsx`.
Acceptance: Retry action slot; rendered in /style.

---

**Issue 9 — Wrap glass utilities in GlassPanel/GlassBar components**
Type: Refactor · Priority: Medium · Deps: none
Scope: new `components/layout/glass.tsx` + replace inline `className="glass-panel"` in Profile, Onboarding, layout.
Acceptance: Grep for `"glass-panel"` as className returns only the wrapper.

---

**Issue 10 — Migrate all ui/button imports to BrutalistButton**
Type: Refactor · Priority: High · Deps: #3
Scope: Find-replace across `apps/web`.
Acceptance: Grep `from "@/components/ui/button"` = 0.

---

**Issue 11 — Delete components/ui/button.tsx**
Type: Refactor · Priority: High · Deps: #10
Scope: Delete file; confirm build.
Acceptance: File gone; `pnpm build` passes.

---

**Issue 12 — Closet tiles → BrutalistCard density="compact"**
Type: UI · Priority: High · Deps: #4
Scope: `apps/web/app/closet/page.tsx`.
Acceptance: No inline `border border-border bg-card`; all tiles use component.

---

**Issue 13 — Archive tiles → BrutalistCard density="compact" + dropdown menu**
Type: UI · Priority: Medium · Deps: #4
Scope: `apps/web/app/archive/page.tsx`; move "I wore this"/"Remove" into a dropdown.
Acceptance: One visible primary per tile; keyboard-accessible menu.

---

**Issue 14 — Plan hub preview band**
Type: UX · Priority: Low · Deps: #4
Scope: `apps/web/app/plan/page.tsx`; add "Next outfit" + "Next trip packing %" band above the 2 cards.
Acceptance: Band renders when data exists; skeletons otherwise.

---

**Issue 15 — Replace Outfit detail custom overlay with BrutalistDialog**
Type: UI + UX · Priority: High · Deps: #5
Scope: `apps/web/app/outfit/page.tsx`.
Acceptance: Modal traps focus; Escape closes; Save is the single solid primary.

---

**Issue 16 — Embed Add-Garment form in Onboarding step 2**
Type: UX · Priority: High · Deps: #5
Scope: `apps/web/app/onboarding/page.tsx`; extract Add form to a reusable sheet.
Acceptance: Adding a garment during onboarding does not leave the route; step state preserved.

---

**Issue 17 — Add Garment: single-click analyze + progress bar**
Type: UX · Priority: Medium · Deps: none
Scope: `apps/web/app/add/page.tsx`.
Acceptance: Drop or select image → analyze triggers automatically with visible `BrutalistProgress`; fields populate.

---

**Issue 18 — Replace all raw "Loading…" strings with LoadingState**
Type: Refactor · Priority: Medium · Deps: #6
Scope: outfit, archive, plan, profile, onboarding.
Acceptance: Grep `"Loading…"` returns 0 (in app/).

---

**Issue 19 — Replace empty text blocks with EmptyState**
Type: Refactor · Priority: Medium · Deps: #7
Scope: closet, outfit, archive, plan (where applicable).
Acceptance: All empty states use component with CTA.

---

**Issue 20 — Convert clickable divs to buttons**
Type: Refactor (a11y) · Priority: Medium · Deps: none
Scope: outfit recommendation card, archive card, closet tile.
Acceptance: No `role="button"` on div; focus ring shape matches buttons.

---

**Issue 21 — Delete /mood route; open modal from home link**
Type: UX · Priority: Low · Deps: none
Scope: delete `apps/web/app/mood/page.tsx`; wire home link to local state.
Acceptance: `/mood` 404; nav link still opens modal.

---

**Issue 22 — Merge /kit into /style under a Components tab**
Type: UX + Docs · Priority: Low · Deps: #4, #5
Scope: move kit content into `/style`; delete `/kit` route.
Acceptance: `/kit` 404; `/style` has "Components" tab with all examples.

---

**End of plan.** Stage 1 (Issues 1–9) unblocks everything else and is the correct starting point for the implementing model.
