# Layout Audit and Responsive Redesign

## 1. Audit Summary: Current Layout Issues

### Horizontal vs vertical contexts

- **Desktop / wide screens**: UI feels like a stretched mobile stack. Single-column content with generous side padding (`px-4 md:px-8 lg:px-12`) but no content max-width on most screens, so on ultra-wide monitors content spreads or sits in a narrow band with large empty margins. No sidebar; navigation is bottom bar only (repeated link patterns in each page header).
- **Tablet landscape**: Same as desktop—bottom nav and full-width content. No use of horizontal space for side-by-side sections (e.g. list + detail, filters + grid).
- **Tablet portrait**: Adequate stacking; grids go 2–3 columns. Header and bottom nav both visible; no major breakdown.
- **Mobile portrait**: Clear and thumb-friendly. Fixed header + bottom nav consume vertical space; content uses `pt-24 md:pt-32` and `pb-28` consistently.
- **Mobile landscape**: Not specifically optimized; same as portrait with less vertical room.

### Screen-by-screen issues

| Screen                   | Issues                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Home (authenticated)** | Single column; mood/weather then grid. On wide screens the grid is 3 columns with no max-width—could use 4 or a constrained content width. No sidebar. |
| **Closet**               | Grid 2→3→4 columns; filters and toolbar full width. Garment detail is full-screen modal—on desktop a side panel would use space better.                |
| **Add garment**          | Two-column layout only at `lg` (1024px); between ~768–1023px form and upload stack in one column. No content max-width.                                |
| **Archive**              | Grid 1→2→3; same single-column shell. Fine on mobile; on wide screens could use 4 columns or constrained width.                                        |
| **Outfit (detail)**      | Single column; explanation then grid. Same modal for garment detail.                                                                                   |
| **Profile**              | Long single column; no split for avatar/settings vs content on desktop.                                                                                |
| **Landing**              | Already has `max-w-[min(96vw,80rem)]` and a 2-column grid at lg; best-behaving page for width.                                                         |

### Navigation

- **Current**: Bottom nav only (Today, Closet, Add, Archive, Profile) + theme toggle. Each page has its own header with OutfAI logo and context links (e.g. Closet / Archive). On desktop the same bottom bar is visible—wastes vertical space and feels mobile-first.
- **Gaps**: No persistent sidebar or top nav for desktop; no adaptive pattern (e.g. bottom nav on small, sidebar on large).

### Containers and grids

- **Page shell**: No shared component. Every page uses `main`, fixed `header` with `px-4 md:px-8 lg:px-12`, and `pt-24 md:pt-32 pb-28`.
- **Content width**: No shared max-width for reading/content; only landing uses one. Lists and grids run full width within padding.
- **Grids**: Inconsistent column counts (2/3/4 vs 1/2/3); no shared responsive grid primitive.

### Modals and overlays

- Garment detail (closet, outfit) and delete confirmation use full-screen overlay modals. On desktop, a side sheet or constrained panel would improve orientation and use of space.

### Spacing and hierarchy

- Section spacing varies (`mb-12`, `mb-16`, `mb-24`). No design tokens; spacing is ad hoc. Hierarchy is clear (serif titles, uppercase labels) but density is uneven.

---

## 2. Responsive Layout Strategy

### Breakpoints (Tailwind defaults)

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px — threshold for sidebar + hide bottom nav
- **xl**: 1280px
- **2xl**: 1536px

### Principles

1. **Mobile**: Keep stacked, thumb-friendly layout; preserve bottom nav and fixed header.
2. **Tablet**: Improve grouping; allow 2-column where useful (e.g. add garment: upload | form at md, not only lg).
3. **Desktop (lg+)**: Introduce sidebar for primary nav; hide bottom nav; use content max-width and multi-column grids where appropriate.
4. **Wide (xl/2xl)**: Constrain content width to avoid over-stretched single column; use 4-column grids or split panes where it helps.

### Layout primitives

| Primitive                    | Purpose                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **PageContainer**            | Consistent horizontal padding and optional max-width for content.               |
| **ContentGrid**              | Responsive grid: 1 col (default), 2 at sm/md, 3–4 at lg/xl with consistent gap. |
| **SplitPane**                | Two regions (e.g. upload                                                        | form) that stack on small screens and sit side-by-side from md or lg. |
| **AppSidebar** (conditional) | Left sidebar on lg+ for authenticated app routes; nav links + theme toggle.     |
| **SectionHeader**            | Optional consistent section title + subtitle for scanability.                   |

### Navigation strategy

- **&lt; lg**: Bottom nav (existing); keep as-is, ensure touch targets.
- **≥ lg**: App sidebar (new) with same nav items + theme toggle; bottom nav hidden via `lg:hidden`.

### Content width

- Introduce `--content-max-width: 90rem` (and optional `--content-narrow: 65rem`) in CSS. PageContainer uses these so wide screens get a readable content band instead of full-width stretch.

---

## 3. Screens / Components Updated

- **Layout**: Root layout wraps with conditional sidebar; ConditionalBottomNav gets `lg:hidden`.
- **Layout primitives**: New `PageContainer`, `ContentGrid`, `SplitPane`, `SectionHeader` in `components/layout/`. New `AppSidebar` + `ConditionalAppShell` (sidebar + main offset).
- **Home (authenticated)**: Uses PageContainer, ContentGrid; grid 2→3→4 with max-width.
- **Closet**: PageContainer, ContentGrid; garment detail uses Sheet on lg+ (optional follow-up), modal on small.
- **Add**: PageContainer, SplitPane (upload | form) from md; consistent spacing.
- **Archive**: PageContainer, ContentGrid (1→2→3→4).
- **Outfit**: PageContainer, ContentGrid; same detail behavior as closet.
- **Profile**: PageContainer; optional split for avatar/settings on lg+ (later).
- **Landing**: Unchanged structure; can use PageContainer for consistency.

---

## 4. Breakpoint / Orientation Behavior (Major Screens)

| Viewport         | Navigation | Home               | Closet           | Add            | Archive          |
| ---------------- | ---------- | ------------------ | ---------------- | -------------- | ---------------- |
| Mobile portrait  | Bottom nav | Stack; 1-col grid  | 2-col grid       | Stack          | 1-col grid       |
| Mobile landscape | Bottom nav | 1–2 col grid       | 2-col grid       | Stack          | 2-col grid       |
| Tablet portrait  | Bottom nav | 2-col grid         | 3-col grid       | Stack or 2-col | 2-col grid       |
| Tablet landscape | Bottom nav | 3-col grid         | 4-col grid       | 2-col split    | 3-col grid       |
| Desktop          | Sidebar    | 3–4 col, max-width | 4-col, max-width | 2-col split    | 4-col, max-width |
| Large desktop    | Sidebar    | 4-col, max-width   | 4-col, max-width | 2-col split    | 4-col, max-width |

---

## 5. Navigation Changes

- **ConditionalBottomNav**: Add `lg:hidden` so it is hidden when viewport is lg or larger.
- **ConditionalAppShell** (new): Renders a fixed left sidebar on lg+ for authenticated, non–no-nav routes. Main content gets `lg:pl-[14rem]` so it sits beside the sidebar. Sidebar contains: OutfAI logo (link to /), Today, Closet, Add, Archive, Profile, theme toggle.
- **Per-page headers**: Kept; they sit inside the main content area. On lg+ the sidebar provides primary nav; page headers still give context (e.g. “Closet”, “Archive” link).

---

## 6. New Layout Primitives (Implemented)

| Component               | Location                                      | Purpose                                                                                                                   |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **PageContainer**       | `components/layout/page-container.tsx`        | `mx-auto` + horizontal padding (`px-4 md:px-8 lg:px-10 xl:px-12`) + optional `max-w-[90rem]` or `max-w-[65rem]` (narrow). |
| **ContentGrid**         | `components/layout/content-grid.tsx`          | Responsive grid: **cards** = 1→2→3→4 cols, **tiles** = 2→3→4 cols with tighter gap.                                       |
| **SplitPane**           | `components/layout/split-pane.tsx`            | Two columns from `md`, stacks on small; optional `leftFraction` (1/3, 1/2, 2/5).                                          |
| **SectionHeader**       | `components/layout/section-header.tsx`        | Serif title + optional subtitle and label; consistent margin.                                                             |
| **AppSidebar**          | `components/layout/app-sidebar.tsx`           | Fixed left sidebar (hidden below `lg`): logo, Today / Closet / Add / Archive / Profile, theme toggle.                     |
| **ConditionalAppShell** | `components/layout/conditional-app-shell.tsx` | Renders `AppSidebar` on lg+ for authenticated non–no-nav routes; wraps children in `div.lg:pl-56`.                        |

Root layout now wraps `PageTransition` with `ConditionalAppShell`. Bottom nav has `lg:hidden` so it is hidden when the sidebar is visible.

---

## 8. Tradeoffs and Approximations

- **Detail panels**: Garment detail remains a full-screen modal in this pass. A future change can use Sheet/Drawer on lg+ for a side panel without changing behavior on small screens.
- **Profile**: Not split into sidebar + content in this redesign; can be done in a follow-up.
- **useIsMobile**: Currently 768px; sidebar uses Tailwind `lg` (1024px). No change to the hook; sidebar visibility is CSS-only (lg:).
- **Landing**: Already responsive; only optional use of PageContainer for token consistency.

---

## 9. Validation

- **TypeScript**: `npm run typecheck` passes.
- **ESLint**: `npm run lint` passes; existing warnings in other files are unchanged.
- **Build**: `npm run build` compiles successfully; page-data collection fails when `CONVEX_SITE_URL` is unset (existing env requirement, not caused by this redesign).
- **Manual**: Test at 360px, 768px, 1024px, 1280px, and 1920px width; verify sidebar appears at lg+, bottom nav hidden at lg+, and content uses PageContainer max-width and grids scale correctly.
