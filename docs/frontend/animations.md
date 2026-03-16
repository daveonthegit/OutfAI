# Frontend animations

OutfAI uses [Framer Motion](https://www.framer.com/motion/) for UI animations. All animation logic lives in a single utility layer under `apps/web/lib/animations/` so that components stay simple and behavior is consistent.

## Design principles

- **Fluid, minimal, modern** — Slight scale, fade, and slide. Nothing flashy or slow.
- **Transform + opacity only** — No animating `width`, `height`, `top`, or `left` to avoid layout thrashing and keep 60fps.
- **Respect reduced motion** — All helpers check `prefers-reduced-motion: reduce` and skip or simplify animations when the user prefers less motion.
- **Mobile-safe** — Animations degrade gracefully and avoid heavy CPU use so Expo/mobile builds stay responsive.

## Utility modules

| File                        | Purpose                                                                         |
| --------------------------- | ------------------------------------------------------------------------------- |
| `prefers-reduced-motion.ts` | Detects `prefers-reduced-motion` and caches the result.                         |
| `shuffle.ts`                | Shuffle feedback: scale + opacity stagger on a list after order/content change. |
| `stagger.ts`                | Staggered entry: fade-in + small `translateY` with per-item delay (variants).   |
| `hover.ts`                  | Card hover: motion props for scale 1 → 1.03, soft shadow, optional glow.        |
| `pageTransitions.ts`        | Page enter: short fade + slide (< 350ms).                                       |

## Usage

### Shuffle (e.g. recommendation grid)

After updating the list (e.g. user clicked "Shuffle"):

```ts
import { animateShuffleGrid } from "@/lib/animations";

// gridRef is a ref to the container that wraps the cards
if (gridRef.current) animateShuffleGrid(gridRef.current);
```

### Staggered entry

When a list first appears (e.g. recommendations, archive, closet), use Framer Motion variants on a container and its children:

```ts
import { getStaggerVariants } from "@/lib/animations";
import { motion } from "framer-motion";

const staggerVariants = getStaggerVariants();

<motion.div
  variants={staggerVariants.container}
  initial="hidden"
  animate="visible"
  className="grid ..."
>
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerVariants.item}>
      <YourCard {...item} />
    </motion.div>
  ))}
</motion.div>
```

### Card hover

Use motion props from `getCardHoverMotionProps()` on a `motion.div`:

```ts
import { motion } from "framer-motion";
import { getCardHoverMotionProps } from "@/lib/animations";

<motion.div {...getCardHoverMotionProps()} className="...">
  ...
</motion.div>
```

### Page transitions

The root layout wraps content in `<PageTransition>`, which runs a subtle enter animation (fade + slide) when the route (pathname) changes. No extra wiring in pages.

## Reduced motion

All helpers call `prefersReducedMotion()` from `prefers-reduced-motion.ts`. When it returns `true`:

- Shuffle, stagger, hover, and page transition animations are no-ops or minimal (e.g. instant opacity).
- Page transition still shows content immediately so navigation isn't jarring.

The check is done once per session and cached. To reset the cache (e.g. in tests), use `resetReducedMotionCache()`.

## Performance

- Only **transform** and **opacity** are animated (and optional **box-shadow** for hover).
- No animating layout properties; no forced reflow.
- Framer Motion uses requestAnimationFrame-friendly updates.
- Stagger delays are small (e.g. 60ms per item) to keep total duration short.

## Where it's used

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
