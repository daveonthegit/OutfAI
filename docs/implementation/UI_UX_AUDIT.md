# OutfAI — Full UI/UX Audit

> Senior product design and frontend audit of the OutfAI web app. Evaluates layout, navigation, usability, feedback, responsiveness, and accessibility to produce an actionable improvement plan.  
> Branch: `audit/ui-ux-audit`.

---

## 1. Product understanding summary

### What the product does

**OutfAI** is a **wardrobe-first outfit intelligence** web app. Users:

- **Manage a digital closet** — Add, edit, delete garments (photo, category, color, tags, traits).
- **Get context-aware outfit recommendations** — From their own wardrobe using **mood** (casual, formal, cozy, etc.) and **weather** (Open-Meteo + geolocation or manual city).
- **See explainable scores** — Each outfit has a 0–100 score and human-readable reasoning plus an expandable score breakdown.
- **Save and archive looks** — Save outfits from Today; view in Archive; mark “I wore this”; remove.
- **Use style insights** — Wardrobe gaps, complete-the-look tips, style/occasion advice (text-only, no product catalog required).
- **Optional product suggestions** — External product recommendations when configured; not on home by default.

**Tech:** Next.js 15 (App Router), React 19, TypeScript, Convex (DB, auth via BetterAuth, file storage), Tailwind 4, Radix UI, “cybersigilism” design system (zero radius, editorial typography, signal orange accent).

### Primary user flows

| Flow                    | Steps                                                                                                | Key screens                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Onboarding**          | Welcome → add garments → preferences → try outfit → done (or skip)                                   | `/onboarding`                   |
| **Add garment**         | Add → upload image (optional analyze) → category, color, tags, traits → Add to closet                | `/add`, `/closet`               |
| **Browse closet**       | Closet → filters/search → tap item → detail modal (view/delete)                                      | `/closet`                       |
| **Generate outfits**    | Today → set mood (modal) + weather → auto-generate → grid of options                                 | `/` (authenticated home)        |
| **View recommendation** | Tap outfit card → outfit detail (explanation, garments, score breakdown)                             | `/outfit`                       |
| **Save outfit**         | Today → Save Look → select options → Save; or single Save on card                                    | `/`, `/archive`                 |
| **Archive**             | Archive → search/filter/sort → view saved look → “I wore this” / Remove                              | `/archive`                      |
| **Profile / account**   | Profile (edit name, username, bio, avatar, preferences) → Settings (password, email, export, delete) | `/profile`, `/profile/settings` |

### Target user behavior

- **Reduce daily outfit decision time** — Mood + weather → instant options.
- **Use existing wardrobe more** — Closet as source of truth; no shopping-first.
- **Trust recommendations** — Explainable scores and reasoning.

---

## 2. UI structure map

### App shell

```
RootLayout (layout.tsx)
├── Providers, OnboardingGuard, ThemeProvider
├── ConditionalAppShell (sidebar on lg+ when authenticated)
│   └── PageTransition → {children}
├── ConditionalBottomNav (bottom nav when < lg, hidden on no-nav routes)
└── Toaster (Sonner, bottom-center)
```

### Navigation

- **&lt; lg:** Fixed bottom nav — Today, Closet, Add, Archive, Plan, Profile + theme toggle.
- **≥ lg:** Fixed left sidebar (collapsible) — same items as “Planner” + theme + collapse. Bottom nav hidden.
- **No-nav routes:** `/`, `/login`, `/signup`, `/check-email`, `/verify-email`, `/forgot-password`, `/reset-password`, `/onboarding` (nav hidden per `lib/routes.ts` and ConditionalBottomNav).

**Inconsistency:** Sidebar label is “Planner”; bottom nav label is “Plan”. Active state for Plan: sidebar treats `/plan`, `/calendar`, `/packing` as active; bottom nav only checks `/plan` and `/packing` (not `/packing/[id]`).

### Page hierarchy

| Route               | Layout      | Header                                 | Content pattern                                                        |
| ------------------- | ----------- | -------------------------------------- | ---------------------------------------------------------------------- |
| `/` (landing)       | No nav      | Logo + CTA                             | Hero + gallery + sign up / sign in                                     |
| `/` (auth)          | Nav         | Logo + UserAvatar                      | PageContainer → mood/weather → grid → style insights → actions         |
| `/closet`           | Nav         | Logo, Closet/Archive links, UserAvatar | PageContainer → SectionHeader → search → filters → ContentGrid (tiles) |
| `/add`              | Nav         | Logo, Back to closet, UserAvatar       | PageContainer → SectionHeader → SplitPane (upload \| form)             |
| `/archive`          | Nav         | Logo, Closet/Archive, UserAvatar       | PageContainer → SectionHeader → toolbar → grouped ContentGrid (cards)  |
| `/outfit`           | Nav (query) | —                                      | Single outfit detail (from Today or Archive)                           |
| `/profile`          | Nav         | Logo, Settings/Profile, UserAvatar     | PageContainer narrow → avatar, identity, preferences, activity         |
| `/profile/settings` | Nav         | —                                      | Password, email, export, delete account                                |
| `/plan`             | Nav         | —                                      | Plan hub (calendar, packing)                                           |
| `/mood`             | Nav         | —                                      | Mood picker (can redirect to /?openMood=1)                             |
| `/onboarding`       | No nav      | —                                      | Wizard steps                                                           |

### Major screens

- **Landing** — Public; max-width content, 2-col at lg; no shared PageContainer token.
- **Authenticated home (Today)** — Mood line (button opens modal), weather pill, divider “X Options”, recommendation grid (ContentGrid cards), style insights, Save Look / Shuffle, “Why this works” link.
- **Closet** — SectionHeader “closet”, search, category chips + Select, selection toolbar, garment grid (tiles), garment detail full-screen modal, delete confirmation modal.
- **Add garment** — SectionHeader “add garment”, SplitPane: upload (aspect 3/4) + form (name, category, color, tags, traits), “Add to closet” CTA.
- **Archive** — SectionHeader “archive”, search + sort + mood filter chips, grouped sections (This week / This month / Older), outfit cards with hover “I wore this” / Remove, click → outfit detail.
- **Profile** — Narrow PageContainer; avatar, name/username/email/bio, Edit profile; preferences (moods, styles, colors, style goal); activity; Sign out; link to Settings.
- **Settings** — Danger zone (password, email, export, delete).

### Reusable UI components

- **Layout:** `PageContainer`, `ContentGrid` (cards/tiles), `SplitPane`, `SectionHeader`, `AppSidebar`, `ConditionalAppShell`, `ConditionalBottomNav`, `AppHeader` (used implicitly via inline headers).
- **Design system:** `BrutalistButton`, `BrutalistCard`, `BrutalistInput`, `BrutalistAvatar`, `BrutalistBadge`, `BrutalistToggle`, `BrutalistCheckbox`, `BrutalistProgress`, `BrutalistTooltip`, `Tag`.
- **Feature:** `OutfitRecommendationCard`, `StyleInsightsSection`, `MoodSelectModal`, `UserAvatar`, `outfit-composition`, `external-product-card`.
- **Feedback:** Sonner toasts, `Skeleton` for loading, empty states (inline in pages).

### Layout patterns

- **Header:** Every main page uses a fixed `<header>` with same padding (`px-4 md:px-8 lg:px-10 xl:px-12`, `py-5`), duplicated per page (no shared `AppHeader` wrapper with slot).
- **Content padding:** `pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28` repeated on each page.
- **Modals:** Garment detail and delete confirmation are custom overlay divs (not Radix Dialog/AlertDialog); no focus trap or Escape documented in audit read.

---

## 3. UX audit findings

### 3.1 Layout & information hierarchy

**Strengths**

- `PageContainer` and `ContentGrid` give consistent max-width and responsive grids.
- Section headers (serif, uppercase) create clear hierarchy.
- Home “today feels {mood}” is a strong editorial focal point.

**Issues**

- **Excessive vertical stacking on desktop** — Home is mood → weather → divider → grid → insights → actions. On wide screens the grid could sit beside a sticky mood/weather strip to reduce scroll.
- **Wasted horizontal space** — Profile uses `max-w-xl` in a single column; no sidebar or two-column layout for avatar vs preferences on lg+.
- **Inconsistent section spacing** — Mix of `mb-6`, `mb-10`, `mb-12`, `mb-16`, `mb-24` without a spacing scale; no design token (e.g. `--section-gap`).
- **Weak section separation** — Dividers are ad hoc (flex + h-px); no consistent “section” wrapper with bottom border or spacing token.
- **Scanning difficulty** — Add garment form is one long column of trait blocks; grouping (Basics vs Traits) or progressive disclosure would help.

**Recommendations**

- Introduce a spacing scale (e.g. 4, 6, 8, 10, 12, 16, 24) and use it via tokens or Tailwind config.
- Consider a sticky “context” strip on home (lg+) with mood + weather so the grid is the main focus.
- Use `SectionHeader` (or a section wrapper) consistently with a single spacing token for section margins.
- Add garment: group “Name, Category, Color, Tags” as “Basics” and “Style, Fit, Occasion, etc.” as “Traits” with optional collapse for Traits.

---

### 3.2 Navigation & wayfinding

**Strengths**

- Bottom nav (mobile) and sidebar (desktop) align with existing layout doc; Plan/Planner is discoverable.
- Page headers repeat context (e.g. “Closet”, “Archive”) and cross-links (Closet ↔ Archive on closet page).
- Sidebar collapse and theme toggle are clear.

**Issues**

- **Label inconsistency** — Sidebar: “Planner”; bottom nav: “Plan”. Same destination, different words.
- **Active state for nested routes** — Bottom nav `isActive` for Plan uses `pathname === "/packing"`; `/packing/123` does not match. Sidebar correctly uses `pathname.startsWith("/packing")` and calendar.
- **No breadcrumbs** — From `/outfit`, `/profile/settings`, or `/packing/[id]` there is no breadcrumb (e.g. “Plan → Packing → Trip name”).
- **Where am I?** — On `/outfit` (query-based) the header is not standardized; on settings the only cue is “Settings” in the header. Sub-routes under Plan (calendar, packing list) don’t show parent context in a consistent way.
- **Contextual actions** — “Back to closet” on Add is good; Archive could add “Generate more like this” or “View on Today” for consistency.

**Recommendations**

- Unify label: use “Plan” everywhere (or “Planner” everywhere); fix bottom nav active to include `pathname.startsWith("/packing")` and `pathname === "/calendar"`.
- Add optional breadcrumbs for Plan sub-routes and Settings (e.g. Profile > Settings). Use existing `ui/breadcrumb` or a minimal custom breadcrumb.
- Standardize outfit detail page header (e.g. “Outfit” + back to Today or Archive).
- Consider a shared `AppHeader` component that accepts left (logo/back), center (optional title), right (nav links + UserAvatar) so every page uses the same shell and “current section” is obvious.

---

### 3.3 User flows

**Add garment**

- **Flow:** Add → upload (or skip) → category, color required; name/tags optional; traits optional. “Add to closet” → redirect to closet.
- **Issues:** No edit from closet (tap garment → only view/delete). Users cannot fix category/color after the fact without deleting and re-adding. “Auto-fill from image” is easy to miss (small link under preview).
- **Recommendation:** Add “Edit” in garment detail modal/sheet; surface “Auto-fill from image” as a primary action (e.g. button) when image is present.

**Browse wardrobe**

- **Flow:** Closet → filter by category, search by name → tap item → modal.
- **Issues:** On desktop, full-screen modal is heavy; no keyboard shortcut to close (Escape not verified in custom modal). Grid hover dims non-hovered items (good) but select-mode affordance (checkbox) could be larger on touch.
- **Recommendation:** On lg+, consider Sheet/Drawer for garment detail instead of full-screen modal; ensure Escape and focus trap in all modals.

**Generate outfit**

- **Flow:** Today → mood (button) → weather (auto or city) → grid loads; Shuffle or Save Look.
- **Issues:** First-time empty closet triggers seed; user may not realize recommendations are from mock data until they see “Add to closet”. No explicit “Generating…” state on the grid title during first load (only “Generating…” in divider). Save Look requires two steps (enter select mode, then select, then save); single-card save is clearer.
- **Recommendation:** When showing mock-based recommendations, add a small inline note (“Using sample items — add your own for personalized results”) and CTA to Add. Make “Save Look” and multi-select flow more discoverable (e.g. short tooltip or first-time hint).

**View recommendation / outfit detail**

- **Flow:** Card click → `/outfit?outfit=...` with serialized data.
- **Issues:** URL is fragile (long encoded payload); no direct link to “this saved outfit” by ID from archive (archive navigates with serialized state). Back button returns to previous page; no persistent “Back to Today” or “Back to Archive” in header.
- **Recommendation:** Prefer route by ID where possible (e.g. `/outfit/[id]` for saved outfits) and keep query for ephemeral Today view. Outfit detail page: add explicit back CTA (Today / Archive) in header.

**Edit/delete garment**

- **Flow:** Closet → tap → modal → Delete (then confirm) or Close. No edit.
- **Recommendation:** Add Edit in modal; edit form could reuse Add form with prefill and “Update” instead of “Add to closet”.

---

### 3.4 Component design

**Cards**

- Outfit cards (recommendation and archive) use aspect-square, border, hover motion (scale/shadow), accent line on hover. Consistent.
- **Issue:** Some cards use `motion.div` with `getCardHoverMotionProps`; closet grid tiles do not use card hover (only dim). Slight inconsistency.

**Buttons**

- BrutalistButton and inline button styles (uppercase, tracking) are consistent. Primary actions (e.g. “Add to closet”, “Save”) use foreground/background or signal-orange.
- **Issue:** Destructive (Delete) uses `red-600`; design system uses `destructive` token. Some pages use raw red, others could use `destructive` for consistency.

**Modals**

- Garment detail and delete confirmation are custom overlays with `fixed inset-0`, `bg-black/50` or `bg-black/60`, and a centered panel. No Radix Dialog.
- **Issues:** Focus trap and Escape-to-close not verified; no `aria-modal` or `role="dialog"` in the snippets reviewed. Click-outside-to-close is implemented.

**Forms**

- Add garment: raw inputs and button groups; labels are uppercase small type. Good.
- **Issues:** No shared `BrutalistInput` on Add page (inline classes); error state is inline text (e.g. `saveError`, `analyzeError`). Form errors could use a consistent placement (e.g. under submit button or at top of form).

**Filters / search**

- Closet: search input with clear; category chips; select mode. Archive: search, sort select, mood chips. Patterns are similar.
- **Issue:** Archive sort dropdown uses native `<select>`; styling is custom. Consider a single “filter bar” component (search + sort + chips) for reuse and consistent focus/aria.

**Image displays**

- Garment images: aspect-square, object-cover, fallback placeholder with category text. Good. No lazy-loading issues noted.

**Recommendations**

- Use Radix Dialog or AlertDialog for garment detail and delete confirmation (focus trap, Escape, aria). Or add `role="dialog"`, `aria-modal="true"`, and Escape handler to custom modals.
- Standardize destructive actions to `destructive` token.
- Introduce a small `FilterBar` (search + optional sort + chips) and use it on Closet and Archive.
- Use `BrutalistInput` (or one shared input component) on Add page for name and tag input for consistency.

---

### 3.5 Visual consistency

**Spacing**

- Padding is consistent in headers and PageContainer. Section margins vary (mb-6 to mb-24). No single scale.

**Typography**

- Serif (Instrument Serif) for hero/mood; sans (Inter) for UI. Uppercase labels with tracking. Consistent.
- **Issue:** Some pages use `text-[10px]` or `text-[11px]`; others use `text-xs`. A small type scale (xs, sm, base) with clear roles would reduce drift.

**Color**

- Design tokens (background, foreground, card, muted, border, signal-orange, destructive) are defined. Most screens use them.
- **Issue:** Landing uses hardcoded rgba (e.g. `rgba(249,244,237,0.98)`); auth pages may mix tokens and raw colors. Prefer tokens everywhere.

**Icons**

- Inline SVGs (stroke 1.5, 18–24px). No icon library. Consistent stroke style.
- **Issue:** Duplication between sidebar and bottom nav (same icons defined twice). Consider a small `NavIcon` set in one file.

**Shadows / borders**

- Borders: `border-border`; no radius (0). Shadows used on cards (hover). Consistent with style doc.

**Hover / focus**

- Hover: color transitions (e.g. `hover:text-signal-orange`). Focus: some buttons have `focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange`; many controls do not. Inconsistent focus visibility.

**Recommendations**

- Define a spacing scale and use it for section margins (e.g. `space-section`).
- Define a type scale (caption, label, body, title) and map to Tailwind; replace ad hoc `text-[10px]` with scale tokens.
- Replace landing (and auth) hardcoded colors with CSS variables where possible.
- Add visible focus styles to all interactive elements (buttons, links, inputs, chips); use `focus-visible` and ring or outline.

---

### 3.6 Responsive design

**Current behavior**

- **Mobile portrait:** Single column; bottom nav; fixed header; content pt/pb for nav. Good.
- **Tablet:** ContentGrid goes 2–3 cols; SplitPane on Add from md. Adequate.
- **Desktop (lg+):** Sidebar; ContentGrid 3–4 cols; PageContainer max-width. Good.
- **Landing:** Has its own max-width and 2-col grid at lg; not using PageContainer.

**Issues**

- **Archive toolbar** — Search + sort stack on small; mood chips wrap. Could use a single responsive filter row with overflow scroll for chips on very small screens.
- **Closet grid** — `variant="tiles"` uses `gap-0.5 sm:gap-1`; on mobile tiles can feel tight; touch targets for chips and “Select” are adequate but could be larger (min 44px).
- **Add form** — On narrow md the form column can be long; “Add to closet” is at the bottom. Sticky CTA on scroll could help.
- **Profile** — Single column always; on large screens the narrow `max-w-xl` leaves a lot of empty space. Optional 2-col (avatar + identity | preferences) on xl would use space better.
- **Bottom nav** — 6 items + theme; on very small screens labels may truncate (text-[8px] md:text-[9px]). Consider hiding labels on xs and showing only icons, or ensuring “Plan”/“Add” don’t wrap.

**Recommendations**

- Ensure all interactive elements meet ~44px min touch target on touch devices (buttons, nav items, chips).
- Add form: consider sticky “Add to closet” bar when scrolling past fold on small screens.
- Profile: optional SplitPane or two-column layout on xl.
- Test archive and closet at 360px width; add horizontal scroll or “Show more” for mood chips if needed.

---

### 3.7 Interaction & feedback

**Loading**

- Closet: skeleton grid. Home: skeleton grid for recommendations. Archive: “Loading…” text. Add: “Saving…”, “Analyzing…” on buttons. Good.
- **Issue:** First load of home (before garments load) triggers generate; the transition from “Generating…” to “X Options” is clear but the grid can pop in. Stagger animation is applied; good.

**Success**

- Toasts for garment add, outfit save, profile/settings success. Good.
- **Issue:** “Saved!” on home (after Save Look) is toast only; the button text changes to “Saved!” but select mode exits; no persistent “Saved” state on the card. Acceptable.

**Errors**

- API errors surface via toast and sometimes inline (e.g. analyze error, save error on Add). Good.
- **Issue:** Form validation (e.g. username taken, bio length) is inline; could be summarized at top of form for accessibility.

**Empty states**

- Closet: “No garments yet” + link to Add. Archive: “No saved looks yet” + link to Today. Good.
- **Issue:** Empty search/filter on Archive: “No looks match your search or filters.” No “Clear filters” button; user must change inputs manually. Add a “Clear all” for search + mood + sort.

**Hover / press**

- Cards and buttons have hover styles. Press (active) state is not consistently applied (e.g. buttons don’t always have `active:scale-[0.98]` or similar). Minor.

**Transitions**

- PageTransition in layout; stagger and shuffle animations on grids. Good. Reduced motion is respected (animations doc).

**Recommendations**

- Add “Clear all” or “Reset filters” on Archive when any filter/search/sort is active.
- Add a brief loading state for “I wore this” and “Remove” on archive cards (e.g. disabled + spinner) so double-submit is avoided.
- Consider consistent active state for primary buttons (e.g. slight scale down on press).

---

### 3.8 Accessibility

**Color contrast**

- Foreground on background and muted-foreground on background should be checked (WCAG AA). Design tokens use near-black and bone/white; signal-orange on background should be verified for text and icons.

**Keyboard navigation**

- Focus order in modals not verified; custom modals may not trap focus. Radix components (e.g. Dropdown, Dialog) handle focus when used; custom overlay does not.
- **Issue:** Garment detail modal: focus can leave the modal; no focus trap. Delete confirmation same.

**Focus states**

- Some buttons have `focus-visible:ring-2 focus-visible:ring-signal-orange`; many links and chips do not. Inconsistent.

**Screen reader**

- Some `aria-label` on icon buttons (e.g. theme, clear search). Images have alt (e.g. garment name). Form labels are visible; some inputs have `aria-label` (search).
- **Issue:** Decorative dividers use `aria-hidden`; good. “today feels {mood}” button has “Change mood”; good. Score breakdown “See why” expandable: state (expanded/collapsed) should be communicated (aria-expanded, aria-controls).

**Semantics**

- Headers: pages use `<header>` and sometimes `<h1>` (home); SectionHeader may not emit heading level. Archive uses `<h2>` for “This week” etc. Good.
- **Issue:** Nav items in bottom nav and sidebar are links; good. But custom modal is a div; should be `role="dialog"` and have `aria-labelledby` / `aria-describedby` if applicable.

**Recommendations**

- Run contrast check (e.g. WebAIM) on foreground, muted-foreground, and signal-orange on background; fix if below AA.
- Use Radix Dialog/AlertDialog for garment detail and delete confirmation, or add focus trap, Escape, and `role="dialog"` with aria attributes to custom modals.
- Add visible focus style (ring or outline) to all interactive elements; use `focus-visible`.
- Ensure “See why” and other expandables have `aria-expanded` and `aria-controls`.
- Document heading hierarchy (one h1 per page; SectionHeader as h2) and ensure no skip.

---

## 4. Top UX issues (prioritized)

### Critical

1. **No way to edit a garment** — Users can only view or delete; fixing a wrong category/color requires re-adding. High impact on trust and data quality.
2. **Custom modals lack focus trap and Escape** — Garment detail and delete confirmation don’t trap focus or close on Escape; keyboard and screen-reader users are poorly served.
3. **Plan/Planner and active state inconsistency** — Label mismatch (Plan vs Planner) and bottom nav not marking `/packing/[id]` or `/calendar` as active cause confusion.

### High impact

4. **No “Clear all” for archive filters** — When search/filter/sort return zero results, users must manually clear each control; “Clear all” would reduce friction.
5. **First-time users see mock data without clear notice** — Seeded recommendations can look like real recommendations; add a short notice and CTA to add real garments.
6. **Outfit detail page has no clear back path** — From `/outfit?outfit=...` there is no explicit “Back to Today” or “Back to Archive”; back button only.
7. **Destructive actions use raw red** — Use `destructive` token everywhere for consistency and theme support.
8. **Focus styles missing on many controls** — Links, chips, and some buttons lack visible focus; keyboard users lose track of focus.

### Moderate

9. **Section spacing and type scale are ad hoc** — Spacing (mb-6 to mb-24) and font sizes (text-[10px], text-xs) drift; a small scale would help.
10. **Profile is single column on all sizes** — On large screens a two-column or sidebar layout would use space better.
11. **Add garment “Auto-fill from image” is easy to miss** — Small link; should be a primary action when image exists.
12. **Archive “I wore this” / “Remove” have no loading state** — Risk of double submit; add disabled + loading feedback.

### Polish

13. **Landing uses hardcoded colors** — Replace with design tokens where possible.
14. **Nav icons duplicated** — Sidebar and bottom nav define the same SVGs twice; centralize.
15. **Sticky CTA on Add** — “Add to closet” could stick on scroll on small screens.
16. **Consistent active/press state** — Buttons could share a subtle active state (e.g. scale).

---

## 5. Detailed improvement recommendations

### Layout

- **Spacing scale:** Add a scale (e.g. 4, 6, 8, 10, 12, 16, 20, 24) and use for section margins (e.g. `mb-section` or `space-y-section`). Apply in PageContainer children and SectionHeader.
- **Home desktop:** Optional sticky strip for mood + weather on lg+ so the grid is the main focus and vertical scroll is reduced.
- **Profile desktop:** On xl, use SplitPane or two columns: left = avatar + identity + activity; right = preferences + sign out.
- **Section wrapper:** Optional `<Section>` component with consistent bottom margin and optional border, used by home, closet, archive, add.

### Navigation

- **Unify Plan/Planner** — Use one label everywhere (e.g. “Plan”) and fix bottom nav `isActive` to `pathname === "/plan" || pathname === "/calendar" || pathname.startsWith("/packing")`.
- **Breadcrumbs** — Add minimal breadcrumbs for Plan (e.g. Plan → Packing → Trip name) and Profile → Settings. Reuse or extend `ui/breadcrumb`.
- **Outfit detail header** — Add explicit back link(s): “Back to Today” when coming from Today, “Back to Archive” when coming from Archive (e.g. pass source in state or query).
- **Shared AppHeader** — Consider one component: left (logo or back), optional center title, right (context links + UserAvatar). Use on every main page so header structure and “current” section are consistent.

### Components

- **Garment detail:** Use Radix Dialog (or add focus trap + Escape + `role="dialog"` + aria). On lg+, consider Radix Sheet for a side panel instead of full-screen.
- **Delete confirmation:** Use Radix AlertDialog for focus trap, Escape, and aria.
- **FilterBar:** Shared component: optional search input, optional sort select, optional chip group. Use on Closet (search + chips) and Archive (search + sort + mood chips). Include “Clear all” when any filter is active.
- **BrutalistInput on Add:** Use design system input for name and tag input; keep category/color as button groups.
- **Destructive actions:** Replace `red-600` / `red-700` with `destructive` and `hover:bg-destructive/90` or similar so theme and dark mode stay consistent.

### Design system

- **Type scale:** Define caption (10px), label (11px), body (sm/base), title (lg), display (serif). Map to Tailwind and use in SectionHeader and forms.
- **Focus:** Add a global or component-level focus style (e.g. `focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2`) to buttons, links, inputs, and chips. Prefer `focus-visible` only for keyboard.
- **Spacing token:** e.g. `--section-gap: 1.5rem` (or 24px) and use for section margins.

### Feedback

- **Archive:** “Clear all” / “Reset filters” when `searchQuery || filterMood !== 'all' || sortBy !== 'newest'` (or when filtered list length < total).
- **Archive cards:** Disable “I wore this” and “Remove” while request is in flight; show spinner or “…” in button.
- **Home mock data:** When `convexGarments.length === 0` and recommendations are shown, show a small banner: “Using sample items. Add your own for personalized results” with link to Add.

---

## 6. Responsive design improvements

- **Touch targets:** Audit buttons, nav items, category chips, and filter chips; ensure min height/width ~44px on touch (or use larger tap area with transparent padding).
- **Add page:** Sticky “Add to closet” bar when the CTA scrolls out of view on small viewports (e.g. `position: sticky; bottom: 0` with safe area above bottom nav).
- **Profile:** At `xl`, switch to two-column or sidebar layout for avatar/identity vs preferences.
- **Archive toolbar:** On very narrow screens, consider horizontal scroll for mood chips with fade or “More” so the row doesn’t wrap into many lines.
- **Bottom nav:** Ensure “Plan” and “Add” labels don’t wrap on 360px; if needed, shorten to “Plan”/“Add” only or icon-only at xs with tooltip.

---

## 7. Navigation improvements (summary)

- Unify Plan/Planner label and fix active state for Plan sub-routes in bottom nav.
- Add breadcrumbs for Plan sub-routes and Profile → Settings.
- Outfit detail: add explicit “Back to Today” / “Back to Archive” in header.
- Consider shared AppHeader component (logo/back, title, nav + avatar) for every main page.
- Ensure `/packing/[id]` and `/calendar` are treated as “Plan” in both sidebar and bottom nav.

---

## 8. Component design improvements (summary)

- Replace custom garment and delete modals with Radix Dialog/AlertDialog (or add focus trap, Escape, role, aria).
- On lg+, consider Sheet for garment detail.
- Add FilterBar (search + sort + chips + “Clear all”) and use on Closet and Archive.
- Use BrutalistInput on Add for text fields; use `destructive` for all delete/danger actions.
- Add visible focus-visible style to all interactive elements.
- Optional: shared NavIcon component to avoid duplicating SVG icons between sidebar and bottom nav.

---

## 9. Implementation roadmap

### Quick wins (1–2 days)

- Unify “Plan”/“Planner” and fix bottom nav active state for `/calendar` and `/packing/[id]`.
- Add “Clear all” / “Reset filters” on Archive when filters are active.
- Use `destructive` token for delete buttons (closet, archive, settings).
- Add focus-visible ring to primary interactive elements (buttons, links, inputs, chips) via a shared class or Tailwind layer.
- Add small “Using sample items…” notice on home when closet is empty and recommendations are shown.

### Medium effort (3–7 days)

- Garment edit: add “Edit” to garment detail; new route `/closet/[id]/edit` or inline form in modal with “Update” (reuse Add form logic with prefill).
- Replace custom garment detail and delete modals with Radix Dialog and AlertDialog; ensure focus trap and Escape.
- Add breadcrumbs for Plan (Plan → Packing / Calendar) and Profile → Settings.
- Outfit detail page: add back link (Today/Archive) in header; pass source via query or state.
- FilterBar component and use on Closet + Archive; include “Clear all”.
- Add loading state for “I wore this” and “Remove” on archive cards.
- Sticky “Add to closet” bar on Add page for small viewports.

### Large design refactors (1–2 sprints)

- Design system: spacing scale and type scale; apply section spacing and typography tokens across pages.
- Profile: two-column or sidebar layout on xl.
- Home: optional sticky context strip (mood + weather) on desktop.
- Shared AppHeader component and migrate all pages to use it.
- Accessibility pass: contrast check, full keyboard nav and focus trap audit, aria for expandables and dialogs; document in `docs/issues/28-accessibility-audit.md`.
- Optional: Sheet for garment detail on lg+; keep full-screen modal on smaller screens.

---

## 10. Implementation suggestions (tech stack fit)

- **Layout:** Keep using `PageContainer`, `ContentGrid`, `SplitPane`, `SectionHeader`; add optional `Section` wrapper with `mb-section` and optional border. Spacing scale can be Tailwind theme extension or CSS variables.
- **Modals:** Radix Dialog and AlertDialog are already in the repo (`components/ui/dialog`, `components/ui/alert-dialog`); use them for garment detail and delete confirmation. For lg+ garment detail, Radix Sheet (`components/ui/sheet`) is available.
- **Focus:** Add a utility class e.g. `focus-visible-ring` in globals or in a shared component and apply to buttons, links, inputs, and filter chips.
- **Navigation:** NAV_ITEMS live in both `app-sidebar.tsx` and `bottom-nav.tsx`; extract to `lib/nav-items.ts` or `components/layout/nav-items.tsx` (icons + href + label) and import in both; fix active logic in one place (e.g. `isPlanActive(pathname)`).
- **Breadcrumbs:** Use existing `components/ui/breadcrumb` or a thin wrapper that takes `items: { label, href? }[]` and renders with current design system typography.
- **FilterBar:** New component under `components/layout/` or `components/ui/`: props for search (value, onChange, placeholder), sort (value, onChange, options), chips (value, options, onChange), onClearAll. Use on closet and archive pages.

This audit is intentionally critical and specific to the codebase so that improvements are actionable and aligned with the existing design system and architecture.
