# OutfAI — Full Feature Implementation Plan

> Comprehensive plan covering all features from Phase 2 through Phase 5.
> Similar features are combined into logical groups. Each group is self-contained
> with schema changes, backend work, frontend work, and dependencies listed.
>
> **Prerequisite:** Phase 1 is complete (recommendation logs, password reset, loading/toasts/empty states, score breakdown, manual weather fallback).

---

## How to Read This Plan

- **Groups** are thematic clusters of related features.
- **Phases** indicate recommended build order (Phase 2 first, etc.).
- Schema changes show **new tables** and **field additions to existing tables**.
- Each feature lists estimated complexity: `S` (1–2 days), `M` (3–5 days), `L` (1–2 weeks).

---

## Phase 2 — Foundation & Core UX

> Goal: Make the app feel complete for a single user. Profile, preferences, onboarding, search.

### Group A: Profile & Preferences

Combines: **User Preferences UI**, **Editable Profile**, **Style Goal Setting**

#### Schema Changes

```
garments (add fields):
  purchasePrice    v.optional(v.number())
  purchaseCurrency v.optional(v.string())       // default "USD"
  purchaseDate     v.optional(v.number())        // epoch ms
  purchaseStore    v.optional(v.string())
  condition        v.optional(v.string())        // "new" | "good" | "fair" | "worn"
  lastWornAt       v.optional(v.number())        // epoch ms, updated on "worn" log
  wearCount        v.optional(v.number())        // incremented on "worn" log
  inLaundry        v.optional(v.boolean())       // default false

userPreferences (add fields):
  styleGoal        v.optional(v.string())        // free-text target aesthetic
  styleGoalTags    v.optional(v.array(v.string()))  // parsed tags from goal
```

No new tables needed — `userPreferences` and `profiles` already exist.

#### Backend (Convex)

| Task                                 | Detail                                                                                                                                      | Size |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `userPreferences.save`               | Already exists. Add `styleGoal` and `styleGoalTags` to args and handler.                                                                    | S    |
| `userPreferences.get`                | Already returns explicit + learned. No change needed.                                                                                       | —    |
| `profile.update`                     | Already handles `bio`. Identity fields (name, username) are updated via BetterAuth client `authClient.updateUser()`. Document this in code. | S    |
| `profile.setAvatar` / `removeAvatar` | Already implemented.                                                                                                                        | —    |

#### Frontend

| Task                                          | Detail                                                                                                                                                                                                                                                                                 | Size |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Preferences page** (`/profile/preferences`) | Form with multi-select chips for: favorite moods (from `Mood` type), preferred styles, preferred colors, avoided colors. Use existing `BrutalistButton` chip variant. Save via `userPreferences.save`.                                                                                 | M    |
| **Style goal input**                          | Text input on preferences page: "Describe your style goal" + optional tag picker. Saved to `userPreferences`.                                                                                                                                                                          | S    |
| **Editable profile** (`/profile/settings`)    | Existing route. Add: editable name field (calls `authClient.updateUser({ name })`), editable username (calls `authClient.updateUser({ username })`), avatar upload (already has `profile.generateAvatarUploadUrl` + `profile.setAvatar`), bio textarea (already has `profile.update`). | M    |
| **Profile display** (`/profile`)              | Show avatar, name, username, bio, style goal, wardrobe stats. Already partially built; enhance with new fields.                                                                                                                                                                        | S    |

#### Dependencies

- None — this is foundational.

---

### Group B: Onboarding Flow

Combines: **Onboarding Flow** (guided first-run with profile setup, add garments, set preferences, try mood)

#### Schema Changes

```
profiles (add field):
  onboardingComplete  v.optional(v.boolean())   // default false
```

#### Backend (Convex)

| Task                         | Detail                                                               | Size |
| ---------------------------- | -------------------------------------------------------------------- | ---- |
| `profile.completeOnboarding` | New mutation: sets `onboardingComplete: true`.                       | S    |
| `profile.getOrCreate`        | Already exists. Returns profile which includes `onboardingComplete`. | —    |

#### Frontend

| Task                                  | Detail                                                                                                                                | Size |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Onboarding wizard** (`/onboarding`) | Multi-step flow (existing stub page to be replaced):                                                                                  | M    |
| Step 1: Welcome                       | Brief intro + "Let's set up your wardrobe"                                                                                            | —    |
| Step 2: Add garments                  | Inline add-garment form. Show progress: "Add at least 3 items." Counter badge. Reuse existing garment create mutation + image upload. | —    |
| Step 3: Set preferences               | Inline version of preferences form (moods, styles, colors). Reuse `userPreferences.save`.                                             | —    |
| Step 4: Try it                        | Auto-trigger a mood selection → show first outfit recommendation. Reuse `useOutfitRecommendations` hook.                              | —    |
| Step 5: Done                          | Celebration screen + CTA to home. Call `profile.completeOnboarding`.                                                                  | —    |
| **Redirect logic**                    | In authenticated layout or middleware: if `onboardingComplete !== true` and path is not `/onboarding`, redirect to `/onboarding`.     | S    |
| **Skip option**                       | "Skip for now" link on each step. Calls `completeOnboarding` and goes to home.                                                        | S    |

#### Dependencies

- Group A (preferences form is reused in step 3).
- Existing garment create mutation.

---

### Group C: Closet Search

Combines: **Closet Search**

#### Schema Changes

```
garments (add index):
  .searchIndex("search_name", { searchField: "name", filterFields: ["userId"] })
```

Convex supports full-text search indexes. Alternative: client-side filter if garment count stays under ~500 per user.

#### Backend (Convex)

| Task              | Detail                                                                                                                                                    | Size |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `garments.search` | New query: accepts `searchTerm` string. Uses Convex `search` index on `name` field, filtered by `userId`. Falls back to `garments.list` if term is empty. | S    |

#### Frontend

| Task                          | Detail                                                                                                    | Size |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ---- |
| **Search bar** on closet page | `BrutalistInput` with search icon at top of closet grid. Debounced (300ms) input calls `garments.search`. | S    |
| **"No results" state**        | Empty state when search returns nothing: "No garments match '{term}'" with clear button.                  | S    |

#### Dependencies

- None.

---

## Phase 3 — Wardrobe Intelligence & Planning

> Goal: Make the app a daily-use planning tool with calendar, analytics, and smart features.

### Group D: Garment Lifecycle & Closet Management

Combines: **Garment Lifecycle Tracking**, **Receipt / Price Tracker**, **Laundry Awareness**, **Donation / Declutter Mode**, **Wardrobe Completeness Score**

#### Schema Changes

Fields added to `garments` in Group A above (`purchasePrice`, `purchaseCurrency`, `purchaseDate`, `purchaseStore`, `condition`, `lastWornAt`, `wearCount`, `inLaundry`).

```
New table — declutterSuggestions (optional, can also be computed on-the-fly):
  Not needed if computed client-side or in a query. Skip table; compute in query.
```

#### Backend (Convex)

| Task                                  | Detail                                                                                                                                                 | Size |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| `garments.create` / `garments.update` | Add new optional fields to args: `purchasePrice`, `purchaseCurrency`, `purchaseDate`, `purchaseStore`, `condition`.                                    | S    |
| `garments.toggleLaundry`              | New mutation: toggles `inLaundry` boolean on a garment.                                                                                                | S    |
| `garments.markWorn`                   | New mutation (or extend recommendation log handler): increments `wearCount`, sets `lastWornAt` to now. Called when "I wore this" is tapped.            | S    |
| `garments.getDeclutterCandidates`     | New query: returns garments not worn in 90+ days, sorted by `lastWornAt` ascending. Includes cost-per-wear if `purchasePrice` and `wearCount` exist.   | S    |
| `garments.getWardrobeCompleteness`    | New query: checks coverage across categories, seasons, occasions. Returns a 0–100 score + list of gaps (e.g., "No rain outerwear", "No formal shoes"). | M    |

#### Server (Services)

| Task                             | Detail                                                                   | Size |
| -------------------------------- | ------------------------------------------------------------------------ | ---- |
| `outfitRecommendationService.ts` | Modify `filterByContext` to exclude garments where `inLaundry === true`. | S    |

#### Frontend

| Task                                     | Detail                                                                                                                                                            | Size |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Garment detail/edit**                  | Add fields to add/edit garment form: purchase price, date, store, condition dropdown.                                                                             | S    |
| **Laundry toggle**                       | Swipe action or toggle button on garment card in closet grid. Greyed-out appearance when in laundry.                                                              | S    |
| **Declutter page** (`/closet/declutter`) | List of garments not worn in 90+ days. Each shows: last worn date, wear count, cost-per-wear. "Donate" button marks as donated (removes from closet or archives). | M    |
| **Wardrobe completeness**                | Card on home or profile page showing score (circular progress) + gap list. Links to "add garment" with pre-filled category for each gap.                          | M    |

#### Dependencies

- "I wore this" flow must call `garments.markWorn` in addition to existing `recommendationLogs.log`.

---

### Group E: Outfit Calendar & Weekly Planner

Combines: **Outfit Calendar**, **Weekly Outfit Planner**, **Weather Week Ahead**, **Calendar Integration**

#### Schema Changes

```
New table — plannedOutfits:
  userId          v.string()
  date            v.string()            // "YYYY-MM-DD"
  garmentIds      v.array(v.id("garments"))
  contextMood     v.optional(v.string())
  contextWeather  v.optional(v.string())
  note            v.optional(v.string())
  source          v.optional(v.string())  // "manual" | "ai-planned" | "calendar-event"
  calendarEventId v.optional(v.string())  // external calendar event ID
  calendarEventTitle v.optional(v.string())
  createdAt       v.number()

  .index("by_userId", ["userId"])
  .index("by_userId_date", ["userId", "date"])
```

#### Backend (Convex)

| Task                             | Detail                                                                   | Size |
| -------------------------------- | ------------------------------------------------------------------------ | ---- |
| `plannedOutfits.listByDateRange` | Query: returns planned outfits for userId between startDate and endDate. | S    |
| `plannedOutfits.set`             | Mutation: upsert a planned outfit for a given date.                      | S    |
| `plannedOutfits.remove`          | Mutation: delete a planned outfit.                                       | S    |

#### Server (API Routes)

| Task                    | Detail                                                                                                                                                                                                                                   | Size |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `POST /api/weekly-plan` | New route: accepts date range + user garments. Calls `OutfitRecommendationService` once per day with that day's weather forecast (Open-Meteo 7-day). Returns array of 5–7 outfits ensuring no repeated garments across consecutive days. | M    |
| `GET /api/weather-week` | New route: returns 7-day forecast from Open-Meteo for user's location/city. Maps each day to a weather condition + temperature + suggested mood.                                                                                         | S    |

#### Frontend

| Task                                       | Detail                                                                                                                                                                                                                                                                                                        | Size |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Calendar page** (`/calendar`)            | Week view (Mon–Sun) with day cards. Each card shows: weather icon + temp, planned outfit thumbnail (garment image stack), or empty "Plan outfit" CTA. Tap a day → opens outfit picker or triggers AI plan for that day. Uses `recharts` or custom grid — the `ui/calendar` component exists for date picking. | L    |
| **"Plan My Week" button**                  | On calendar page header. Calls `/api/weekly-plan`, fills Mon–Fri with AI-selected outfits. User can swap individual days.                                                                                                                                                                                     | M    |
| **Weather week strip**                     | Horizontal strip showing 7-day weather on the calendar page. Data from `/api/weather-week`.                                                                                                                                                                                                                   | S    |
| **Calendar integration** (Phase 4 stretch) | OAuth flow for Google Calendar. Fetch events for the week, show event titles on day cards, use event context (e.g., "Meeting" → formal mood) when generating outfits.                                                                                                                                         | L    |
| **Bottom nav update**                      | Add "Calendar" tab (replace or add alongside existing tabs).                                                                                                                                                                                                                                                  | S    |

#### Dependencies

- Recommendation service (already built).
- Weather API (Open-Meteo, already used).

---

### Group F: Wardrobe Analytics Dashboard

Combines: **Wardrobe Analytics Dashboard**, **Monthly Style Report**

#### Schema Changes

None — all computed from existing `garments`, `outfits`, `recommendationLogs` tables, plus new garment fields from Group D.

#### Backend (Convex)

| Task                         | Detail                                                                                                                                                                             | Size |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `analytics.getWardrobeStats` | New query: returns aggregated stats — garment count by category, color distribution, season distribution, total estimated value (sum of `purchasePrice`), avg cost-per-wear.       | M    |
| `analytics.getWearStats`     | New query: returns most-worn garments (top 10 by `wearCount`), least-worn (bottom 10), wear frequency over time (last 30/90 days from `recommendationLogs` where action = "worn"). | M    |
| `analytics.getMonthlyReport` | New query: for a given month — outfits worn count, new garments added, most-worn items, unique garments used / total garments (utilization %), style variety (unique mood count).  | M    |

#### Frontend

| Task                              | Detail                                                                                                                                      | Size |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Analytics page** (`/analytics`) | Dashboard with multiple chart cards using `recharts` (already installed):                                                                   | L    |
| — Category distribution           | Pie/donut chart: tops, bottoms, shoes, outerwear, accessories.                                                                              | —    |
| — Color palette                   | Horizontal bar chart of top 10 colors. Bars colored to match.                                                                               | —    |
| — Seasonal coverage               | Radar chart: spring, summer, fall, winter, all-season.                                                                                      | —    |
| — Most/least worn                 | Two ranked lists with garment thumbnails + wear count.                                                                                      | —    |
| — Cost-per-wear leaders           | Table: garment name, purchase price, wear count, cost/wear. Sort by cost-per-wear ascending (best value first).                             | —    |
| — Wear frequency heatmap          | Calendar heatmap (like GitHub contributions) showing outfit-logged days over last 90 days.                                                  | —    |
| **Monthly report card**           | Shareable summary card (could reuse for Outfit Sharing). Shows key stats for the month. Accessible from analytics page or via notification. | M    |
| **Bottom nav or profile link**    | Add analytics entry point — icon on profile page or a tab.                                                                                  | S    |

#### Dependencies

- Group D (garment lifecycle fields for cost-per-wear and wear tracking).

---

## Phase 4 — Outfit Intelligence & AI

> Goal: Make recommendations smarter, more interactive, and more contextual.

### Group G: Smart Outfit Features

Combines: **Outfit Remix**, **Surprise Me Mode**, **Dress Code Decoder**, **Multi-Outfit Context**, **Negative Feedback Loop**, **Outfit Clustering**

#### Schema Changes

```
recommendationLogs (add field):
  vetoed  v.optional(v.boolean())   // true = "never suggest this combo again"

New table — outfitVetoes:
  userId      v.string()
  garmentIds  v.array(v.string())   // sorted, for lookup
  reason      v.optional(v.string())
  createdAt   v.number()

  .index("by_userId", ["userId"])
```

Using a separate `outfitVetoes` table is cleaner than a field on `recommendationLogs` because vetoes need fast lookup during generation.

#### Backend (Convex)

| Task                  | Detail                                                                                                  | Size |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ---- |
| `outfitVetoes.add`    | Mutation: insert a veto for a garment combination. Sort garmentIds before storing for consistent dedup. | S    |
| `outfitVetoes.list`   | Query: return all vetoes for user. Used by recommendation service.                                      | S    |
| `outfitVetoes.remove` | Mutation: un-veto a combination.                                                                        | S    |

#### Server (API Routes & Services)

| Task                             | Detail                                                                                                                                                                                                                                                      | Size |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `POST /api/outfit-remix`         | New route: accepts an existing outfit's garmentIds + remix type ("swap-one", "dress-up", "dress-down", "weather-adapt"). Calls recommendation service with constraints: keep N-1 garments fixed, find best replacement for the Nth. Returns 2–3 variations. | M    |
| `POST /api/surprise-me`          | New route: calls recommendation service with no mood/weather filter, random seed, returns 1 outfit. Minimal logic — just randomize the scoring weights.                                                                                                     | S    |
| `POST /api/dress-code`           | New route: accepts a dress code string (e.g., "cocktail attire"). Maps it to mood + occasion + formality constraints using a lookup table. Returns explanation of the dress code + outfit recommendations.                                                  | M    |
| `POST /api/multi-context`        | New route: accepts array of contexts (e.g., `[{mood: "formal", label: "Work"}, {mood: "casual", label: "Dinner"}]`). Generates outfits for each context, then finds transition strategy (which pieces to swap). Returns both outfits + swap instructions.   | M    |
| `outfitRecommendationService.ts` | Modify `generateCandidates` to check vetoes list and exclude vetoed combinations. Accept vetoes as input parameter.                                                                                                                                         | S    |
| `outfitClusterService.ts` (new)  | New service: takes user's saved outfits, clusters by style/mood/color similarity (k-means or simple rule-based grouping). Returns labeled clusters: "Your go-to casual looks", "Bold evening picks", etc.                                                   | M    |

#### Frontend

| Task                                    | Detail                                                                                                                                                                | Size |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Remix button** on outfit cards        | "Remix" icon on saved outfit cards (archive page). Opens modal with remix options: Swap one piece, Dress up, Dress down, Adapt for weather. Shows 2–3 variations.     | M    |
| **Surprise Me button**                  | Large CTA button on home/today page: "Surprise Me" with dice icon. Single tap → shows one random outfit card.                                                         | S    |
| **Dress Code page** (`/dress-code`)     | Input field: "What's the dress code?" + common presets ("Business Casual", "Black Tie", "Smart Casual", "Cocktail"). Shows explanation card + outfit recommendations. | M    |
| **Multi-context flow**                  | Accessible from mood page: "Multiple events today?" toggle. Shows 2 mood/context selectors. Results show both outfits with highlighted swap pieces.                   | M    |
| **"Never suggest this" button**         | On outfit recommendation cards: three-dot menu → "Never suggest this combo." Calls `outfitVetoes.add`. Toast confirmation with undo.                                  | S    |
| **Style clusters** on profile/analytics | Card showing cluster labels with outfit count per cluster. Tap a cluster → filtered view of outfits in that group.                                                    | M    |

#### Dependencies

- Recommendation service modifications for vetoes.
- Existing outfit card components.

---

### Group H: Swipe-Based Outfit Rating

Combines: **Swipe-Based Outfit Rating**

#### Schema Changes

None — uses existing `recommendationLogs` with actions "saved" and "skipped".

#### Frontend

| Task                                              | Detail                                                                                                                                                                                                                                | Size |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Swipe mode** (`/swipe` or toggle on today page) | Full-screen card stack. Swipe right = save (logs "saved"), swipe left = skip (logs "skipped"). Use a gesture library (`@use-gesture/react` or CSS touch events). Cards show outfit composition + score. "Undo" button for last swipe. | M    |
| **Batch generation**                              | Pre-load 10 outfits. When 7 are swiped, fetch 10 more in background.                                                                                                                                                                  | S    |

#### Dependencies

- Existing recommendation API + logs.

---

## Phase 5 — Engagement, Social & Notifications

> Goal: Build retention loops, social features, and proactive nudges.

### Group I: Gamification & Streaks

Combines: **Style Streak / Gamification**, **Closet Milestones**, **Style Challenges**

#### Schema Changes

```
New table — userAchievements:
  userId       v.string()
  type         v.string()        // "streak" | "milestone" | "challenge"
  key          v.string()        // e.g., "7_day_streak", "all_items_worn", "monochrome_monday"
  unlockedAt   v.number()
  metadata     v.optional(v.any())  // e.g., { streakLength: 7 }

  .index("by_userId", ["userId"])

New table — styleChallenges:
  title        v.string()
  description  v.string()
  type         v.string()        // "weekly" | "seasonal" | "one-time"
  criteria     v.string()        // JSON-encoded rule, e.g., {"rule":"monochrome","days":"monday"}
  activeFrom   v.number()
  activeTo     v.number()
  createdAt    v.number()

New table — userChallengeProgress:
  userId       v.string()
  challengeId  v.id("styleChallenges")
  status       v.string()        // "active" | "completed" | "expired"
  completedAt  v.optional(v.number())

  .index("by_userId", ["userId"])
```

#### Backend (Convex)

| Task                         | Detail                                                                                                                                                                                           | Size |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| `achievements.check`         | New mutation (called after "worn" log): checks streak (consecutive days with "worn" logs), milestones (total garments, total outfits, all-items-worn). Inserts new `userAchievements` if earned. | M    |
| `achievements.list`          | Query: return all achievements for user, sorted by `unlockedAt` desc.                                                                                                                            | S    |
| `challenges.getActive`       | Query: return currently active challenges.                                                                                                                                                       | S    |
| `challenges.getUserProgress` | Query: return user's progress on active challenges.                                                                                                                                              | S    |

#### Frontend

| Task                                                          | Detail                                                                                                                                                | Size |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Achievements page** (`/achievements` or section on profile) | Grid of badge cards. Locked badges are greyed out with criteria shown. Unlocked badges show unlock date. Categories: Streaks, Milestones, Challenges. | M    |
| **Streak counter**                                            | Small flame/streak icon on home page header showing current streak count.                                                                             | S    |
| **Challenge cards**                                           | On home page: active challenge card with progress bar. "This week: Wear something you haven't worn in 30 days."                                       | M    |
| **Achievement toast**                                         | When `achievements.check` returns a new achievement, show a celebratory toast with confetti animation.                                                | S    |

#### Dependencies

- "I wore this" flow triggers achievement checking.
- Group D (wear tracking data needed for milestones).

---

### Group J: Sharing & Social

Combines: **Outfit Sharing (Link/Image)**, **Photo-a-Day Journal**, **Mood Board Builder**

#### Schema Changes

```
New table — outfitShares:
  userId       v.string()
  outfitId     v.id("outfits")
  shareToken   v.string()         // unique short token for public link
  imageStorageId v.optional(v.id("_storage"))  // generated collage image
  createdAt    v.number()

  .index("by_token", ["shareToken"])
  .index("by_userId", ["userId"])

New table — dailyPhotos:
  userId       v.string()
  date         v.string()         // "YYYY-MM-DD"
  imageStorageId v.id("_storage")
  note         v.optional(v.string())
  outfitId     v.optional(v.id("outfits"))   // link to planned/saved outfit
  createdAt    v.number()

  .index("by_userId", ["userId"])
  .index("by_userId_date", ["userId", "date"])

New table — moodBoardItems:
  userId       v.string()
  imageUrl     v.optional(v.string())        // external URL
  imageStorageId v.optional(v.id("_storage"))  // uploaded image
  tags         v.array(v.string())
  note         v.optional(v.string())
  createdAt    v.number()

  .index("by_userId", ["userId"])
```

#### Backend (Convex)

| Task                                        | Detail                                                                                                                      | Size |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---- |
| `outfitShares.create`                       | Mutation: generate unique token, optionally generate collage image (server-side canvas or client-side), store share record. | M    |
| `outfitShares.getByToken`                   | Query (public, no auth): fetch shared outfit by token for public view page.                                                 | S    |
| `dailyPhotos.upload`                        | Mutation: save photo for today's date. One per day (upsert).                                                                | S    |
| `dailyPhotos.listByMonth`                   | Query: return photos for a given month.                                                                                     | S    |
| `moodBoardItems.create` / `list` / `remove` | Standard CRUD.                                                                                                              | S    |

#### Server (API Routes)

| Task                              | Detail                                                                                                                           | Size |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `POST /api/generate-outfit-image` | New route: accepts garment image URLs, generates a collage image (using `sharp` or canvas). Returns image buffer or storage URL. | M    |

#### Frontend

| Task                                       | Detail                                                                                                                                                                               | Size |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| **Share button** on outfit cards           | Opens share modal: "Copy link" + "Download image." Generates collage of garment photos with outfit metadata overlay.                                                                 | M    |
| **Public outfit page** (`/shared/[token]`) | Public (no auth) page showing the shared outfit collage, garment details, mood, weather context. "Get OutfAI" CTA for non-users.                                                     | M    |
| **Photo journal page** (`/journal`)        | Calendar grid showing daily photos. Tap a day → view/upload photo. Camera icon for quick capture. Links to that day's planned outfit if exists.                                      | M    |
| **Mood board page** (`/mood-board`)        | Masonry grid of saved inspiration images. Add from URL or upload. Tag each with style keywords. "Match to my closet" button runs recommendation with mood board tags as style input. | M    |

#### Dependencies

- Group E (outfit calendar links to journal photos).
- Image processing capability (new dependency: `sharp` or client-side canvas).

---

### Group K: Notifications & Proactive Nudges

Combines: **Daily Outfit Notification**, **Seasonal Rotation Alerts**, **Monthly Style Report** (delivery), **Shopping List**

#### Schema Changes

```
New table — notificationPreferences:
  userId              v.string()
  dailyOutfitEmail    v.optional(v.boolean())    // default false
  dailyOutfitTime     v.optional(v.string())     // "07:00" local time
  seasonalAlerts      v.optional(v.boolean())
  monthlyReport       v.optional(v.boolean())
  timezone            v.optional(v.string())     // e.g., "America/New_York"

  .index("by_userId", ["userId"])

New table — shoppingList:
  userId       v.string()
  category     v.string()
  color        v.optional(v.string())
  description  v.string()           // "Rain jacket" or "Neutral dress shoes"
  targetPrice  v.optional(v.number())
  sourceGapType v.optional(v.string())  // links to ClosetGapType
  fulfilled    v.optional(v.boolean())
  fulfilledGarmentId v.optional(v.id("garments"))
  createdAt    v.number()

  .index("by_userId", ["userId"])
```

#### Backend (Convex + Cron)

| Task                                               | Detail                                                                                                                                              | Size |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `notificationPreferences` CRUD                     | Standard get/save mutations.                                                                                                                        | S    |
| `shoppingList` CRUD                                | Standard create/list/update/remove mutations. `fulfill` mutation links a garment and marks fulfilled.                                               | S    |
| Convex scheduled function: `dailyOutfitDigest`     | Runs daily (Convex cron). For each user with `dailyOutfitEmail: true`: fetch weather, generate 1 outfit, send via Resend email template.            | M    |
| Convex scheduled function: `seasonalRotationCheck` | Runs at season transitions (4x/year). For each user: find garments for the new season that haven't been worn recently. Send email nudge via Resend. | M    |
| Convex scheduled function: `monthlyReportDigest`   | Runs 1st of each month. Generates stats (reuse `analytics.getMonthlyReport`), sends email.                                                          | M    |

#### Server (API Routes)

| Task                             | Detail                                                                                                                                           | Size |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| `POST /api/seasonal-suggestions` | Given user's garments and current season, return items to rotate in (current season, low recent wear) and rotate out (off-season, taking space). | S    |

#### Frontend

| Task                                               | Detail                                                                                                                                                                                     | Size |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| **Notification settings** (on `/profile/settings`) | Toggle cards for: daily outfit email, seasonal alerts, monthly report. Time picker for daily email.                                                                                        | S    |
| **Seasonal rotation page** (`/closet/seasonal`)    | Two columns: "Rotate In" (items for this season) and "Rotate Out" (off-season items). Mark items as stored/accessible.                                                                     | M    |
| **Shopping list page** (`/shopping-list`)          | List of wanted items from wardrobe gaps. Each shows: description, category, target price, source gap. "Mark as bought" links to a garment. Auto-populated from `closetGapService` results. | M    |
| **Add to shopping list** from style insights       | When style insights show a gap, "Add to shopping list" button.                                                                                                                             | S    |

#### Dependencies

- Group D (wardrobe completeness + gap detection for shopping list auto-population).
- Group F (monthly report data).
- Resend (already configured for auth emails).

---

## Implementation Order Summary

```
Phase 2 (Foundation — ~3-4 weeks)
├── Group A: Profile & Preferences         ~1 week
├── Group B: Onboarding Flow               ~1 week  (depends on A)
└── Group C: Closet Search                 ~2-3 days (independent)

Phase 3 (Intelligence & Planning — ~5-6 weeks)
├── Group D: Garment Lifecycle & Closet Mgmt  ~2 weeks
├── Group E: Outfit Calendar & Weekly Planner ~2 weeks (partially parallel with D)
└── Group F: Wardrobe Analytics Dashboard     ~2 weeks (depends on D)

Phase 4 (AI & Interaction — ~4-5 weeks)
├── Group G: Smart Outfit Features            ~3 weeks
└── Group H: Swipe-Based Outfit Rating        ~1 week  (independent)

Phase 5 (Engagement & Social — ~5-6 weeks)
├── Group I: Gamification & Streaks           ~2 weeks (depends on D)
├── Group J: Sharing & Social                 ~2 weeks (independent)
└── Group K: Notifications & Proactive Nudges ~2 weeks (depends on D, F)
```

---

## Complete Schema Additions Reference

### Modified Tables

| Table             | New Fields                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `garments`        | `purchasePrice`, `purchaseCurrency`, `purchaseDate`, `purchaseStore`, `condition`, `lastWornAt`, `wearCount`, `inLaundry` |
| `garments`        | New search index: `search_name` on `name` field                                                                           |
| `userPreferences` | `styleGoal`, `styleGoalTags`                                                                                              |
| `profiles`        | `onboardingComplete`                                                                                                      |

### New Tables

| Table                     | Phase | Purpose                                          |
| ------------------------- | ----- | ------------------------------------------------ |
| `plannedOutfits`          | 3     | Calendar-based outfit planning                   |
| `outfitVetoes`            | 4     | "Never suggest this combo" blocklist             |
| `userAchievements`        | 5     | Earned badges, streaks, milestones               |
| `styleChallenges`         | 5     | Weekly/seasonal style challenges (admin-created) |
| `userChallengeProgress`   | 5     | Per-user challenge tracking                      |
| `outfitShares`            | 5     | Public outfit sharing with tokens                |
| `dailyPhotos`             | 5     | Photo-a-day journal                              |
| `moodBoardItems`          | 5     | Inspiration mood board                           |
| `notificationPreferences` | 5     | Email notification opt-ins                       |
| `shoppingList`            | 5     | Wardrobe gap shopping wishlist                   |

### New Indexes

| Table                     | Index            | Fields                                  |
| ------------------------- | ---------------- | --------------------------------------- |
| `garments`                | `search_name`    | Full-text on `name`, filter by `userId` |
| `plannedOutfits`          | `by_userId`      | `userId`                                |
| `plannedOutfits`          | `by_userId_date` | `userId`, `date`                        |
| `outfitVetoes`            | `by_userId`      | `userId`                                |
| `userAchievements`        | `by_userId`      | `userId`                                |
| `userChallengeProgress`   | `by_userId`      | `userId`                                |
| `outfitShares`            | `by_token`       | `shareToken`                            |
| `outfitShares`            | `by_userId`      | `userId`                                |
| `dailyPhotos`             | `by_userId`      | `userId`                                |
| `dailyPhotos`             | `by_userId_date` | `userId`, `date`                        |
| `moodBoardItems`          | `by_userId`      | `userId`                                |
| `notificationPreferences` | `by_userId`      | `userId`                                |
| `shoppingList`            | `by_userId`      | `userId`                                |

---

## New API Routes Summary

| Route                             | Phase | Purpose                                      |
| --------------------------------- | ----- | -------------------------------------------- |
| `POST /api/weekly-plan`           | 3     | AI-generated week of outfits                 |
| `GET /api/weather-week`           | 3     | 7-day weather forecast with mood suggestions |
| `POST /api/outfit-remix`          | 4     | Variations of a saved outfit                 |
| `POST /api/surprise-me`           | 4     | Random outfit, no context                    |
| `POST /api/dress-code`            | 4     | Decode dress code + outfit suggestions       |
| `POST /api/multi-context`         | 4     | Multiple-event outfit planning               |
| `POST /api/generate-outfit-image` | 5     | Collage image for sharing                    |
| `POST /api/seasonal-suggestions`  | 5     | Season rotation recommendations              |

---

## New Pages Summary

| Route                        | Phase | Purpose                               |
| ---------------------------- | ----- | ------------------------------------- |
| `/profile/preferences`       | 2     | Set moods, styles, colors, style goal |
| `/onboarding` (replace stub) | 2     | Guided first-run wizard               |
| `/closet/declutter`          | 3     | Donation/declutter suggestions        |
| `/calendar`                  | 3     | Outfit calendar + weekly planner      |
| `/analytics`                 | 3     | Wardrobe analytics dashboard          |
| `/swipe`                     | 4     | Tinder-style outfit rating            |
| `/dress-code`                | 4     | Dress code decoder                    |
| `/achievements`              | 5     | Badges, streaks, challenges           |
| `/journal`                   | 5     | Photo-a-day diary                     |
| `/mood-board`                | 5     | Inspiration board                     |
| `/shopping-list`             | 5     | Wardrobe gap wishlist                 |
| `/closet/seasonal`           | 5     | Season rotation view                  |
| `/shared/[token]`            | 5     | Public shared outfit (no auth)        |

---

## New Dependencies (npm)

| Package              | Purpose                              | Phase |
| -------------------- | ------------------------------------ | ----- |
| `@use-gesture/react` | Swipe gestures for outfit cards      | 4     |
| `sharp` (server)     | Image collage generation for sharing | 5     |
| `canvas-confetti`    | Achievement celebration animation    | 5     |

> `recharts` is already installed. No other new deps needed for Phases 2–3.

---

## Cross-Cutting Concerns (All Phases)

| Concern                   | Recommendation                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Rate limiting**         | Add middleware to all new API routes. Use Convex rate limiter or custom token bucket. Priority: Phase 3+.                  |
| **Error boundaries**      | Add React error boundary wrapper around each new page.                                                                     |
| **Loading states**        | Every new page gets skeleton loader matching the brutalist design system.                                                  |
| **Empty states**          | Every list page gets an empty state with CTA (consistent with Phase 1 patterns).                                           |
| **Mobile responsiveness** | All new pages designed mobile-first (existing pattern). Calendar and analytics need special attention.                     |
| **Accessibility**         | New form inputs need labels, new interactive elements need ARIA. Run axe-core on each new page.                            |
| **Tests**                 | Unit tests for new Convex functions and services. E2E for critical flows (onboarding, calendar) when Playwright is set up. |

---

_This plan is a living document. Update as features ship or priorities change._
