# Personalization + Retention Pipeline Plan

Implementation-ready design for a personalization loop driven by `saved` / `skipped` / `worn` feedback on recommended outfits. Grounded in the current Convex schema (`recommendationLogs`, `userPreferences`, `garments`, `outfitPreviews`).

Target executor: a lower-level coding model shipping one issue at a time. No full implementation code here — only contracts, rules, and structure.

---

## 1. System Overview

### Core components

| Component               | Runs                                | Responsibility                                                                    |
| ----------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| **Action Logger**       | Convex mutation                     | Persists every save/skip/worn/shown event into `recommendationLogs`.              |
| **Signal Extractor**    | Convex pure util                    | Reads a log + resolved garments → emits weighted signals `(dim, value, delta)[]`. |
| **Preference Store**    | `userPreferences` table (extended)  | Holds explicit onboarding prefs + learned attribute weights + usage stats.        |
| **Candidate Generator** | Convex query                        | Produces ~30 valid candidate outfits from wardrobe under current context.         |
| **Scoring Engine**      | Convex pure function                | Base score + personalization delta + exploration noise.                           |
| **Ranker**              | inside Scoring Engine               | Sorts + applies ε-greedy exploration.                                             |
| **Retention Layer**     | Next.js components + Convex queries | Streaks, trained-counter, nudges, "why this outfit" chips.                        |

### Data flow

```
Frontend action
  → logOutfitAction mutation
    → recommendationLogs insert
    → onActionLogged trigger (inline)
      → extractSignalsFromLog
      → updatePreferenceWeights → userPreferences.learnedWeights
  (next request)
  → getRankedRecommendations query
    → generateCandidates → scoreOutfitPersonalized → ε-greedy rank
    → returns top 5 to frontend
```

### Boundary rule

Scoring math lives in a pure TS module (`convex/personalization/scoring.ts`) — callable from server actions and unit tests. No I/O inside it.

---

## 2. End-to-End Pipeline

| #   | Step                              | Input                                         | Output                                                                                 |
| --- | --------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | User opens feed / requests outfit | `userId`, context (`mood`, `weather`, `temp`) | request handle                                                                         |
| 2   | Load context bundle               | `userId`                                      | garments, learned weights, explicit prefs, recent 50 logs                              |
| 3   | Candidate generation              | wardrobe + context                            | ~30 candidate outfits (valid top+bottom+shoes; context-filtered)                       |
| 4   | Base scoring                      | candidate, context                            | `baseScore` (0–1): color harmony, occasion fit, weather fit, versatility, completeness |
| 5   | Personalization scoring           | candidate, learnedWeights                     | `personalScore` (−0.5 … +0.5): sum of attribute-weight hits                            |
| 6   | Exploration                       | ranked list                                   | ε-greedy: exploit top N; occasionally surface "stretch" pick                           |
| 7   | Render + log `shown`              | top 5                                         | `recommendationLogs` insert (action=`shown`, `pickMode`)                               |
| 8   | User acts                         | `save` / `skip` / `worn`                      | `logOutfitAction` mutation                                                             |
| 9   | Signal extraction                 | new log                                       | attribute deltas (e.g. `color:black +0.1`)                                             |
| 10  | Preference update                 | deltas, current weights                       | new `learnedWeights` with decay applied                                                |
| 11  | Retention signal                  | log count, streak                             | UI update ("OutfAI learned 3 new things today")                                        |

---

## 3. Preference Model

### Schema additions (conceptual — added to `userPreferences`)

```
learnedWeights: {
  color:    { "<colorName>": number }  // -1 .. +1
  style:    { "<styleTag>":  number }
  tag:      { "<tag>":       number }
  occasion: { "<occasion>":  number }
  category: { "top"|"bottom"|"shoes"|"outerwear"|"accessory": number }
}

stats: {
  totalActions:   number
  savedCount:     number
  skippedCount:   number
  wornCount:      number
  lastUpdated:    number
  streakDays:     number
  lastActionDate: "YYYY-MM-DD"
}
```

All fields optional so existing rows remain valid.

### Signals → weights

| Action    | Per-attribute delta                   |
| --------- | ------------------------------------- |
| `worn`    | **+0.15** (strongest — real behavior) |
| `saved`   | **+0.08**                             |
| `skipped` | **−0.05**                             |
| `shown`   | 0 (impression denominator only)       |

### Update rule

For each garment in the outfit, for each attribute (color, each style tag, each tag, occasion, category):

```
w[dim][value] = clamp(w[dim][value] + delta / tagsInDim, -1, +1)
```

Divide by `tagsInDim` so a 5-tag garment doesn't dominate.

### Decay rule

Daily Convex cron:

```
w[dim][value] *= 0.98
prune anything with |w| < 0.02
```

### Normalization

No global normalization. Instead, scoring clamps personalization contribution to `±0.5` so it never fully overrides base quality.

### Cold-start fallback

```
α = min(totalActions / 10, 1)
```

Explicit onboarding prefs seed weights:

- `preferredStyles[i]` → +0.2
- `preferredColors[i]` → +0.2
- `avoidedColors[i]` → −0.3

---

## 4. Scoring Strategy

**Base score (0..1):**

```
baseScore =
    0.30 * colorHarmony(outfit)
  + 0.25 * occasionFit(outfit, context.mood)
  + 0.20 * weatherFit(outfit, context.weather, context.temp)
  + 0.15 * versatility(outfit)
  + 0.10 * completeness(outfit)  // has top+bottom+shoes
```

**Personalization score:**

```
personalScore =
  sum over garments g in outfit:
    sum over attributes a of g:
      learnedWeights[a.dim][a.value] / attrsInDim(g, a.dim)

clamp(personalScore, -0.5, +0.5)
```

**Final rank score:**

```
rankScore = baseScore + α * personalScore + explorationNoise

explorationNoise:
  with ε=0.15 -> uniform(0, 0.1)
  else        -> 0
```

After `totalActions > 50`, lower ε to 0.08.

**Ranking behavior:** highest `rankScore` wins. ε-greedy produces ~1-in-7 "stretch" picks so the model can discover new preferences.

---

## 5. Reward & Retention Layer

### Visible signals of improvement

1. **Trained-counter** on home: `X outfits trained` — increments on every save/skip/worn.
2. **Streak badge** — consecutive days with ≥1 action.
3. **Adaptive nudge** — after thresholds (5, 20, 50 saves), one-time toast: _"OutfAI noticed you like muted tones."_
4. **"Why this outfit"** — top 2 `topContributors` from scoring as chips under the outfit.
5. **Weekly recap** (v2) — "This week you saved 4, wore 2. Your top style: minimalist."

### Habit loop

- **Cue:** morning push/notification ("Today's pick is ready").
- **Action:** save / skip / worn — one-tap; existing keyboard shortcuts S/X, add W.
- **Variable reward:** exploration slot occasionally surprises.
- **Investment:** every action visibly trains the system → sunk-cost hook.

### Design discipline

Reserve signal orange `#ff4d00` for the trained-counter increment animation only. Everything else stays within the existing cybersigilism palette. Zero border-radius. No gradient text.

---

## 6. Atomic Implementation Units

### U1. `logOutfitAction` (mutation)

- **Purpose:** Write a single user action to `recommendationLogs`.
- **Inputs:** `{ userId, outfitPreviewId?, outfitId?, garmentIds[], action: "shown"|"saved"|"skipped"|"worn", mood?, weather?, pickMode? }`
- **Outputs:** `{ logId }`
- **Deps:** existing `recommendationLogs` table.
- **Location:** `convex/recommendationLogs.ts` (extend).

### U2. `extractSignalsFromLog` (pure util)

- **Purpose:** Given one log + garment docs, return `{ dim, value, delta }[]`.
- **Inputs:** `log`, `garmentDocs[]`
- **Outputs:** flat signal array
- **Location:** `convex/personalization/signals.ts`.

### U3. `applyDecay` (pure util)

- **Purpose:** Multiply all weights by decay factor, prune small values.
- **Inputs:** `learnedWeights`, `decayFactor=0.98`, `pruneThreshold=0.02`
- **Outputs:** new `learnedWeights`
- **Location:** `convex/personalization/decay.ts`.

### U4. `updatePreferenceWeights` (mutation)

- **Purpose:** Merge signals into `userPreferences.learnedWeights`; bump `stats`.
- **Inputs:** `{ userId, signals[] }`
- **Outputs:** void
- **Deps:** U2; extended `userPreferences` schema.
- **Location:** `convex/userPreferences.ts` (extend).

### U5. `onActionLogged` (inline trigger)

- **Purpose:** After U1, fetch garments → U2 → U4.
- **Inputs:** `logId`
- **Outputs:** void
- **Location:** `convex/personalization/hooks.ts`. Called inline from U1 — no Convex scheduler needed at MVP.

### U6. `dailyDecayJob` (cron)

- **Purpose:** Walk all users once/day, apply U3.
- **Inputs:** none
- **Outputs:** count decayed
- **Location:** `convex/crons.ts` + `convex/personalization/jobs.ts`.

### U7. `scoreOutfitPersonalized` (pure function)

- **Purpose:** Compute `baseScore + α * personalScore` for one outfit.
- **Inputs:** `outfit`, `context`, `learnedWeights`, `totalActions`
- **Outputs:** `{ baseScore, personalScore, finalScore, topContributors[] }`
- **Location:** `convex/personalization/scoring.ts`.

### U8. `generateCandidates` (query)

- **Purpose:** Produce ~30 valid candidate outfits from wardrobe under context.
- **Inputs:** `userId, context`
- **Outputs:** `candidates[]`
- **Location:** `convex/recommendations/candidates.ts`.

### U9. `getRankedRecommendations` (query)

- **Purpose:** Full pipeline: context → U8 → U7 → ε-greedy rank → top 5.
- **Inputs:** `userId, context`
- **Outputs:** `{ outfits[], explanations[], pickModes[] }`
- **Location:** `convex/recommendationRank.ts`.

### U10. `OutfitActionButtons` (frontend)

- **Purpose:** Save/Skip/Worn buttons wired to U1. Reuses S/X shortcuts; adds W.
- **Location:** `apps/web/components/outfit/OutfitActionButtons.tsx`.

### U11. `TrainedCounter` (frontend)

- **Purpose:** Reads `userPreferences.stats.totalActions`, animates on change.
- **Location:** `apps/web/components/retention/TrainedCounter.tsx`.

### U12. `WhyThisOutfit` (frontend)

- **Purpose:** Renders `topContributors` from U7 as 2 small chips.
- **Location:** `apps/web/components/outfit/WhyThisOutfit.tsx`.

### U13. `TasteNudge` (frontend + query)

- **Purpose:** After threshold, surface one-time toast naming top learned attribute.
- **Location:** `apps/web/components/retention/TasteNudge.tsx` + `getTopLearnedAttribute` query.

### U14. `StreakBadge` (frontend)

- **Purpose:** Reads `stats.streakDays`, displays streak.
- **Location:** `apps/web/components/retention/StreakBadge.tsx`.

### U15. Unit tests

- **Purpose:** Cover U2, U3, U7 with fixtures — pure, fast.
- **Location:** `tests/personalization/*.test.ts`.

---

## 7. File / Module Plan

```
convex/
  personalization/
    scoring.ts          # U7 pure scorer
    signals.ts          # U2 signal extraction + mapping table
    decay.ts            # U3 decay util
    hooks.ts            # U5 post-log trigger
    jobs.ts             # U6 daily decay
    constants.ts        # deltas, epsilon, alpha, decay factor, thresholds
  recommendations/
    candidates.ts       # U8
    rank.ts             # U9 assembles pipeline
  userPreferences.ts    # extend: learnedWeights + stats + U4 mutation
  recommendationLogs.ts # extend: U1 logOutfitAction
  crons.ts              # register U6
  schema.ts             # add learnedWeights/stats (all optional)

apps/web/
  components/
    outfit/
      OutfitActionButtons.tsx  # U10
      WhyThisOutfit.tsx        # U12
    retention/
      TrainedCounter.tsx       # U11
      TasteNudge.tsx           # U13
      StreakBadge.tsx          # U14

tests/
  personalization/
    signals.test.ts
    decay.test.ts
    scoring.test.ts
```

---

## 8. Issue Breakdown

### I1 — Schema: add `learnedWeights` + `stats` to `userPreferences`

- **Type:** backend / migration
- **Priority:** P0
- **Description:** Extend `userPreferences` schema with optional `learnedWeights` (nested records by dim) and `stats` object. All fields optional.
- **Acceptance:** schema deploys clean; existing users unaffected; `v.optional` on all new fields.

### I2 — Constants module for personalization

- **Type:** backend
- **Priority:** P0
- **Description:** `convex/personalization/constants.ts` with action deltas, decay factor, ε values, α threshold, prune threshold, personalization clamp.
- **Acceptance:** all magic numbers live here; imported everywhere else.

### I3 — Pure signal extractor + tests

- **Type:** backend + test
- **Priority:** P0
- **Description:** Implement U2. Map action + garment attributes → signal array. Normalize per-dimension tag count.
- **Acceptance:** unit tests cover `saved`, `skipped`, `worn`; multi-tag garment splits delta correctly; returns empty for `shown`.

### I4 — Pure decay util + tests

- **Type:** backend + test
- **Priority:** P1
- **Description:** Implement U3.
- **Acceptance:** tests verify multiply + prune; idempotent for empty weights; does not mutate input.

### I5 — `updatePreferenceWeights` mutation

- **Type:** backend
- **Priority:** P0
- **Description:** Implement U4; apply signals to weights; update `stats`; auto-upsert `userPreferences` row for new users.
- **Acceptance:** calling with signals mutates the correct row; new users auto-create row.

### I6 — `logOutfitAction` mutation + inline trigger

- **Type:** backend
- **Priority:** P0
- **Description:** Implement U1 + U5. One mutation writes log then updates preferences in-transaction.
- **Acceptance:** a single call produces a log row + a weight update atomically.

### I7 — Candidate generator

- **Type:** backend
- **Priority:** P1
- **Description:** Implement U8. Produce valid-composition outfits from wardrobe filtered by context.
- **Acceptance:** returns non-empty array when wardrobe has top+bottom+shoes; respects weather filter.

### I8 — Scoring engine + tests

- **Type:** backend + test
- **Priority:** P0
- **Description:** Implement U7 pure function. Returns full breakdown incl. `topContributors`.
- **Acceptance:** deterministic for fixed inputs; α-ramp works; clamps respected.

### I9 — `getRankedRecommendations` query

- **Type:** backend
- **Priority:** P0
- **Description:** Implement U9. Ties U8 + U7 + ε-greedy.
- **Acceptance:** returns 5 ranked outfits; exploration fires at expected frequency in stats test.

### I10 — `OutfitActionButtons` + wire to log mutation

- **Type:** frontend
- **Priority:** P0
- **Description:** Implement U10. Save/Skip/Worn buttons; S/X shortcuts; add W for worn.
- **Acceptance:** each click calls `logOutfitAction` with correct action; toast confirms.

### I11 — `TrainedCounter` component

- **Type:** frontend
- **Priority:** P1
- **Description:** Implement U11. Subscribe to `userPreferences.stats.totalActions`.
- **Acceptance:** increments live after action; single-increment animation; stays in cybersigilism palette.

### I12 — `WhyThisOutfit` chips

- **Type:** frontend
- **Priority:** P1
- **Description:** Implement U12.
- **Acceptance:** shows top 2 contributors; hidden when `totalActions < 5`.

### I13 — `TasteNudge` one-time toast

- **Type:** frontend + backend
- **Priority:** P2
- **Description:** Implement U13 + `getTopLearnedAttribute` query. Fires once per threshold (5, 20, 50 saves).
- **Acceptance:** toast fires exactly once per threshold crossing.

### I14 — `StreakBadge`

- **Type:** frontend
- **Priority:** P2
- **Description:** Implement U14.
- **Acceptance:** increments on action in a new day; resets after a missed day.

### I15 — Daily decay cron

- **Type:** backend
- **Priority:** P2
- **Description:** Implement U6 + register in `crons.ts`.
- **Acceptance:** runs once daily; decays all users' weights; emits run-count log.

### I16 — Exploration + cold-start instrumentation

- **Type:** backend / analytics
- **Priority:** P2
- **Description:** Every `shown` log carries `pickMode: "exploit" | "explore"`.
- **Acceptance:** field present on every new `shown` row.

### I17 — Observability: scoring debug query

- **Type:** backend / dev
- **Priority:** P3
- **Description:** Dev-only query returning full score breakdown for any outfit + user, for tuning.
- **Acceptance:** gated behind `NODE_ENV=development`.

---

## 9. Execution Order

### MVP (ship first — closes the loop end-to-end)

1. **I1** — schema extension
2. **I2** — constants
3. **I3** — signal extractor + tests
4. **I5** — `updatePreferenceWeights`
5. **I6** — `logOutfitAction` + trigger
6. **I10** — `OutfitActionButtons` _(loop is now live; raw logs exist)_
7. **I8** — scoring engine + tests
8. **I7** — candidate generator
9. **I9** — ranked recommendations _(feed switches to personalized)_
10. **I11** — `TrainedCounter` _(first visible reward)_

### V2 — retention depth

11. **I12** — `WhyThisOutfit`
12. **I14** — `StreakBadge`
13. **I13** — `TasteNudge`
14. **I4** + **I15** — decay util + cron _(once weights accumulate ~2 weeks of data)_

### V3 — polish / evaluation

15. **I16** — explore/exploit instrumentation
16. **I17** — debug query
17. Weekly recap email _(new issue, out of scope here)_

### Dependency rules

- Nothing frontend-personalized ships before **I6** — no data to show.
- **I9** is the gate: before it, feed is base-scored; after it, personalization is live.
- **I15** (decay) can wait until real usage exists — no point decaying empty weights.

### MVP success criteria

A new user saves 5 outfits, then the 6th feed visibly re-ranks toward their saved attributes — verifiable by scripted manual test.

---

## Final Rules (for the executing model)

- Prefer simple, interpretable systems.
- Keep scoring math pure and unit-tested.
- Don't ship UI before there's data to render.
- Optimize for fast iteration; every unit should be shippable alone.
- Every change must directly improve personalization, the feedback loop, or retention.
