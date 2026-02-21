# OutfAI — MVP Features

> Feature priority matrix, acceptance criteria, and demo script for the capstone MVP.
> Aligned with the [PRD](./OutfAI_PRD.md) and [Implementation Plan](./implementation-plan.md).

---

## Priority Definitions

| Priority | Meaning               | Rule                                |
| -------- | --------------------- | ----------------------------------- |
| **P0**   | Must ship for demo    | Blocks the capstone presentation    |
| **P1**   | Important, deferrable | Ship if time allows; can be stubbed |
| **P2**   | Nice-to-have          | Post-MVP backlog                    |

---

## Feature Matrix

| #   | Feature                                    | Priority | Phase |
| --- | ------------------------------------------ | -------- | ----- |
| F1  | Authentication (sign up / login / session) | **P0**   | 0-1   |
| F2  | Garment CRUD + image upload                | **P0**   | 1-2   |
| F3  | Mood input                                 | **P0**   | 3     |
| F4  | Weather integration                        | **P0**   | 3     |
| F5  | Outfit generation (from real wardrobe)     | **P0**   | 1-3   |
| F6  | Outfit save / skip                         | **P0**   | 3     |
| F7  | Explainable scoring UI                     | **P0**   | 3     |
| F8  | Garment auto-tagging (stub)                | P1       | 2     |
| F9  | Outfit history / saved outfits list        | P1       | 3-4   |
| F10 | Recommendation analytics (logs)            | P1       | 3     |
| F11 | Onboarding flow                            | P1       | 4     |
| F12 | Storefront suggestions                     | P2       | 5     |
| F13 | Outfit calendar                            | P2       | 5     |
| F14 | Packing planner                            | P2       | 5     |
| F15 | AI vision auto-tagging                     | P2       | 5     |

---

## Cut Line

```
═══════════════════════════════════════════
  Everything ABOVE this line ships for MVP
  F1–F7 = capstone demo scope
═══════════════════════════════════════════
  F8–F11 = stretch goals (ship if time allows)
  F12–F15 = post-MVP backlog
```

---

## P0 Feature Specifications

### F1 — Authentication

**User story:** As a new user, I can create an account and log in so my wardrobe is private and persistent.

**UI surfaces:**

- `/auth/signup` — email + password form
- `/auth/login` — email + password form
- Nav bar — avatar / logout button
- Middleware — redirects unauthenticated users to login

**API endpoints:**

- Supabase Auth SDK (no custom tRPC endpoints needed)
- `protectedProcedure` in tRPC context for all authenticated routes

**DB tables:**

- `users` (managed by Supabase Auth; `auth.users` in the Supabase schema)

**Acceptance criteria:**

- [ ] User can sign up with email and password
- [ ] User can log in and is redirected to `/closet`
- [ ] Session persists across page refresh
- [ ] Unauthenticated access to `/closet`, `/style`, `/mood` redirects to `/auth/login`
- [ ] Logout clears the session and redirects to `/`

---

### F2 — Garment CRUD + Image Upload

**User story:** As a user, I can add clothing items to my digital closet with a photo, edit them, and remove items I no longer own.

**UI surfaces:**

- `/add` — garment creation form (name, category, color, season, material, photo)
- `/closet` — grid of garment cards with thumbnails
- Garment detail modal — edit fields, delete button
- Closet filters — category, season, color dropdown

**API endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `query` | `garments.list` | List user's garments (with optional filters) |
| `query` | `garments.getById` | Single garment with tags |
| `mutation` | `garments.create` | Create garment + upload image |
| `mutation` | `garments.update` | Edit garment fields |
| `mutation` | `garments.delete` | Delete garment + remove image from storage |

**DB tables:**

- `garments` — core item record
- `garment_tags` — tags (auto + user-corrected)

**Acceptance criteria:**

- [ ] User can create a garment with all fields (name, category, color, season, material)
- [ ] User can upload a photo that displays as a thumbnail in the closet
- [ ] User can edit any garment field
- [ ] User can delete a garment (with confirmation dialog)
- [ ] Closet grid filters by category and season
- [ ] Garment persists in the database across sessions
- [ ] Uploading an image >5 MB shows a validation error

---

### F3 — Mood Input

**User story:** As a user, I can tell the app how I'm feeling so it generates outfits that match my mood.

**UI surfaces:**

- Mood selector on `/style` page (emoji cards or styled buttons for 7 moods)
- Selected mood shown as a badge near the generate button

**API endpoints:**

- `mood` parameter on `recommendations.generate` (already exists in schema)

**DB tables:**

- `outfits.context_mood` — stored with the generated outfit

**Acceptance criteria:**

- [ ] 7 mood options displayed: casual, formal, adventurous, cozy, energetic, minimalist, bold
- [ ] Selecting a mood visually highlights the choice
- [ ] Generated outfits respect the mood (e.g., "formal" avoids casual-tagged items)
- [ ] Mood is optional — generation works without it

---

### F4 — Weather Integration

**User story:** As a user, the app knows my local weather so it avoids suggesting outfits that don't suit the conditions.

**UI surfaces:**

- Weather badge on `/style` page showing condition + temperature
- Manual override dropdown (for users who deny geolocation)

**API endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `query` | `weather.current` | Fetch current weather by coordinates or city |

**DB tables:**

- `outfits.context_weather` — stored with the generated outfit

**Acceptance criteria:**

- [ ] Weather auto-detected via browser geolocation
- [ ] Falls back to manual city input if geolocation is denied
- [ ] Weather condition + temperature displayed before generation
- [ ] Generated outfits exclude weather-inappropriate items (no wool at >25 C, no linen at <5 C)
- [ ] Weather data is cached server-side (5 min TTL) to avoid API rate limits

---

### F5 — Outfit Generation (from real wardrobe)

**User story:** As a user, I can generate outfit suggestions from my own closet that are scored and ranked.

**UI surfaces:**

- `/style` page — "Generate" button → outfit card grid
- Each card: garment thumbnails, score bar, short explanation

**API endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `query` | `recommendations.generate` | Generate outfits from user's garments |
| `query` | `recommendations.getOutfit` | Single outfit with garment details |

**DB tables:**

- `garments` (read)
- `outfits` + `outfit_items` (write on save)

**Acceptance criteria:**

- [ ] Outfits are generated from the authenticated user's garments (no mock data)
- [ ] Each outfit contains at least a top + bottom (shoes and accessories optional)
- [ ] Outfits are scored 0-100 with a visible score bar
- [ ] At least 1 outfit is generated when the user has ≥3 garments
- [ ] "Add more garments" message shown when closet has <3 items
- [ ] Generating again produces different results (randomized candidate selection)

---

### F6 — Outfit Save / Skip

**User story:** As a user, I can save outfits I like and skip ones I don't, so I can revisit my favorites.

**UI surfaces:**

- Save (heart) button on each outfit card
- Skip (X) button on each outfit card
- `/closet` or `/style` page: "Saved Outfits" tab

**API endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `mutation` | `recommendations.logInteraction` | Log save/skip/worn action |
| `query` | `outfits.listSaved` | List saved outfits for user |

**DB tables:**

- `recommendation_logs` (action: saved / skipped / worn)
- `outfits` + `outfit_items` (persisted on save)

**Acceptance criteria:**

- [ ] Saving an outfit persists it to the database
- [ ] Saved outfits appear in a "Saved" section
- [ ] Skipping an outfit logs the interaction but does not persist the outfit
- [ ] "I wore this" button available on saved outfits
- [ ] Interaction log records timestamp + action type

---

### F7 — Explainable Scoring UI

**User story:** As a user, I can see why the app recommended an outfit so I trust the suggestions.

**UI surfaces:**

- Outfit detail view — score breakdown bar chart or segmented bar
- Categories: Color Harmony, Mood Alignment, Diversity, Base Score
- Per-garment reasoning line (e.g., "Blue Linen Shirt: breathable for summer, casual tag matches mood")

**API endpoints:**

- Scoring breakdown returned as part of `recommendations.generate` output (extend the response type)

**DB tables:**

- None additional (computed at generation time)

**Acceptance criteria:**

- [ ] Every generated outfit shows a total score (0-100)
- [ ] Tapping/expanding an outfit reveals the score breakdown by category
- [ ] At least one sentence of human-readable explanation per outfit
- [ ] Explanation references specific garment properties (color, material, tags)

---

## Demo Script (3 Minutes)

> Step-by-step walkthrough for the capstone presentation.

### Setup (before demo)

- Pre-seed account with 10+ garments via `npm run seed` (backup plan)
- Open app in mobile-width browser (375px or phone)
- Weather API functional or fallback city set

### Script

| Time | Action                                                     | What the audience sees                                                                                                                             |
| ---- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00 | **Open app** — show landing/home page                      | OutfAI branding, value proposition                                                                                                                 |
| 0:15 | **Sign up** with a new account                             | Sign-up form, instant redirect to onboarding/closet                                                                                                |
| 0:30 | **Upload 3 garments** (pre-photographed clothes)           | Form fills: "Blue Linen Shirt" (tops), "Black Jeans" (bottoms), "White Sneakers" (shoes). Photos appear in closet grid.                            |
| 1:00 | **Show closet** — scroll through grid, apply "tops" filter | Grid filters live. Thumbnails visible.                                                                                                             |
| 1:15 | **Navigate to Style page**                                 | Mood selector + weather badge visible                                                                                                              |
| 1:30 | **Select mood:** "casual"                                  | Mood card highlights                                                                                                                               |
| 1:35 | **Weather auto-detected** (or set manually)                | "Sunny, 22 C" badge                                                                                                                                |
| 1:40 | **Tap "Generate Outfits"**                                 | Loading spinner → 3 outfit cards appear                                                                                                            |
| 2:00 | **Expand first outfit** — show explanation                 | Score: 85/100. Breakdown: Color Harmony 15, Mood 12, Diversity 10, Base 50. "Well-balanced casual outfit with breathable fabrics for a sunny day." |
| 2:20 | **Save the outfit** (tap heart)                            | Heart fills, toast: "Outfit saved!"                                                                                                                |
| 2:30 | **Skip second outfit** (tap X)                             | Card slides away                                                                                                                                   |
| 2:35 | **Show Saved tab**                                         | Saved outfit visible with "I wore this" button                                                                                                     |
| 2:45 | **Wrap up** — mention future features                      | "Next: auto-tagging from photos, storefront suggestions, outfit calendar"                                                                          |
| 3:00 | **End**                                                    |                                                                                                                                                    |

### Contingency

- If weather API is down: manually set city to "New York" (cached response).
- If garment upload fails: switch to pre-seeded account.
- If generation returns 0 outfits: show the seeded account with 12 garments.

---

## Assumptions

- The demo will be on a local or Vercel-deployed environment with Supabase backend.
- The presenter will have a pre-seeded fallback account ready.
- "Auto-tagging" in P1 is a rules-based stub (category → default tags), not ML.
- Storefront integration (P2) requires partner/affiliate API access not yet secured.
