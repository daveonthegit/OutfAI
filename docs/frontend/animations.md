# Frontend animations

OutfAI uses [Anime.js](https://animejs.com/) for UI animations. All animation logic lives in a single utility layer under `apps/web/lib/animations/` so that components stay simple and behavior is consistent.

## Design principles

- **Fluid, minimal, modern** — Slight scale, fade, and slide. Nothing flashy or slow.
- **Transform + opacity only** — No animating `width`, `height`, `top`, or `left` to avoid layout thrashing and keep 60fps.
- **Respect reduced motion** — All helpers check `prefers-reduced-motion: reduce` and skip or simplify animations when the user prefers less motion.
- **Mobile-safe** — Animations degrade gracefully and avoid heavy CPU use so Expo/mobile builds stay responsive.

## Utility modules

| File                        | Purpose                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `prefers-reduced-motion.ts` | Detects `prefers-reduced-motion` and caches the result.                            |
| `shuffle.ts`                | Shuffle feedback: scale + opacity stagger on a list after order/content change.    |
| `stagger.ts`                | Staggered entry: fade-in + small `translateY` with per-item delay.                 |
| `hover.ts`                  | Card hover: scale 1 → 1.03, soft shadow, optional glow (design tokens).            |
| `reorder.ts`                | FLIP-style list reorder: record positions → update DOM → animate to new positions. |
| `pageTransitions.ts`        | Page enter: short fade + slide (< 350ms).                                          |

## Usage

### Shuffle (e.g. recommendation grid)

After updating the list (e.g. user clicked “Shuffle”):

```ts
import { animateShuffleGrid } from "@/lib/animations";

// gridRef is a ref to the container that wraps the cards
if (gridRef.current) animateShuffleGrid(gridRef.current);
```

### Staggered entry

When a list first appears (e.g. recommendations, archive, closet):

```ts
import { staggerFadeInContainer } from "@/lib/animations";

if (containerRef.current) staggerFadeInContainer(containerRef.current);
```

Optional: `staggerFadeIn(elements, { delayPerItem: 80, duration: 320 })`.

### Card hover

On the card element (e.g. recommendation card, archive card):

```ts
import { animateCardHoverIn, animateCardHoverOut } from "@/lib/animations";

onMouseEnter={() => el && animateCardHoverIn(el)}
onMouseLeave={() => el && animateCardHoverOut(el)}
```

### List reorder (FLIP)

When the list order changes in the DOM (e.g. sort, filter):

1. **Before** updating state: `controller.record(containerRef.current)`
2. Update state so React re-renders the new order.
3. **After** paint (e.g. in `useEffect`): `controller.animate()`

```ts
import { createReorderController } from "@/lib/animations";

const reorderController = createReorderController();

// Before reorder
reorderController.record(gridRef.current);
setItems(newOrder);

// In useEffect after items/grid updated
useEffect(() => {
  reorderController.animate();
}, [items]);
```

### Page transitions

The root layout wraps content in `<PageTransition>`, which runs `animatePageIn` on the wrapper when the route (pathname) changes. No extra wiring in pages.

## Reduced motion

All helpers call `prefersReducedMotion()` from `prefers-reduced-motion.ts`. When it returns `true`:

- Shuffle, stagger, hover, and reorder animations are no-ops or minimal.
- Page transition still applies a quick opacity change so navigation isn’t jarring.

The check is done once per session and cached. To reset the cache (e.g. in tests), use `resetReducedMotionCache()`.

## Performance

- Only **transform** and **opacity** are animated (and optional **box-shadow** for hover).
- No animating layout properties; no forced reflow.
- Anime.js uses requestAnimationFrame-friendly updates.
- Stagger delays are small (e.g. 60ms per item) to keep total duration short.

## Where it’s used

| Area                   | Shuffle        | Stagger        | Hover                        | Page transition    |
| ---------------------- | -------------- | -------------- | ---------------------------- | ------------------ |
| Home (recommendations) | ✓ (on Shuffle) | ✓ (first load) | ✓ (OutfitRecommendationCard) | ✓                  |
| Archive                | —              | ✓ (first load) | ✓ (card)                     | ✓                  |
| Closet                 | —              | ✓ (first load) | —                            | ✓                  |
| Layout / navigation    | —              | —              | —                            | ✓ (PageTransition) |

## Adding new animations

1. Add a new helper in `apps/web/lib/animations/` (e.g. `myEffect.ts`).
2. Use `prefersReducedMotion()` and skip or simplify when true.
3. Animate only transform/opacity (and box-shadow if needed).
4. Export from `index.ts`.
5. Call from components; keep animation logic out of large UI components.
