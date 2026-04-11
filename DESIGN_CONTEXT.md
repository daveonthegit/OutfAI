# OutfAI — Design context

## Design Context

### Users

Three equally-weighted personas, each arriving with a distinct headspace:

- **Student / young adult** — building a style identity on a budget, fashion-curious, time-pressed
- **Busy professional** — morning decision fatigue, wants fast reliable picks, efficiency matters
- **Fashion-forward creative** — uses OutfAI as a genuine creative tool, cares deeply about personal expression

The unifying need: **reducing friction between "I have clothes" and "I feel good in what I'm wearing."**

### Brand Personality

Three words: **precise, edgy, considered**

Emotional target: _edgy and inspired_ — like stepping into a well-curated store where the edit itself signals taste. The sharpness comes from restraint, not aggression.

### Aesthetic Direction

**References:**

- **Arc'teryx / CELINE** — Premium restraint. High contrast. Typography-first. Luxury through ruthless editing.
- **Notion / Figma** — Productive, utility-forward, non-corporate personality. The tool recedes so the work takes center stage.

The synthesis: a **high-end design tool with fashion editorial DNA**. The wardrobe is the content — the UI exists to surface it, not compete with it.

**Anti-references:** AI fashion apps with gradient text + glassmorphism; generic SaaS with rounded corners + blue primaries + icon-above-heading grids; streetwear chaos aesthetic.

**Theme:** Both light and dark. Light is primary (morning routines, daylight, phones). Dark should feel equally deliberate.

**Current system:** "Cybersigilism" — zero border radius, signal orange `#ff4d00`, bone-white `#f4f3ef` / near-black `#0a0a0a`. Open to rethinking but evolution should sharpen and refine, not abandon. The zero-radius discipline and restrained accent color strategy should be preserved.

**Typography:**

- **Body / UI / labels:** Hanken Grotesk (Google Fonts) — `font-sans`, loaded via `next/font/google`
- **Display / headings:** Bodoni Moda (Google Fonts) — `font-serif` class, loaded via `next/font/google` with `style: ["normal", "italic"]`
- Bodoni Moda has full italic support — always use `italic` on `font-serif` display elements for editorial character

### Design Principles

1. **The wardrobe takes center stage.** UI is infrastructure, not decoration. Garment photography and user content are the visual heroes.
2. **Luxury through editing.** Add nothing that doesn't earn its place. The signal orange accent works _because_ it's rare.
3. **Precision over personality.** When in doubt: tighter, more contrast, sharper hierarchy. Edge comes from typographic precision, not visual tricks.
4. **Fast and honest.** Interactions feel instant. No spinner theater. Motion is for state changes, not atmosphere.
5. **Design tool meets boutique.** As disciplined as Figma, as considered as a well-curated store. Never sacrifice one for the other.
