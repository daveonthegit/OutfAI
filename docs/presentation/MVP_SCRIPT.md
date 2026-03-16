# OutfAI — MVP Presentation Script

Group 9 · Hunter College · CSCI 499 · Spring 2026  
Target runtime: 10 minutes

---

## Team and Speaking Roles

- **Jiecong Wu Wu** — Demo operator, frontend/UX narration, product definition
- **David Xiao** — Backend/architecture explanation, remaining work, timeline
- **Kevin Ye** — Recommendation logic, technical challenges, future work

---

## Timing Overview

| Section                              | Time       | Speaker                             |
| ------------------------------------ | ---------- | ----------------------------------- |
| Slide 1: Title + intro               | 0:00–0:30  | Jiecong                             |
| Slide 2: Live demo                   | 0:30–6:30  | Jiecong, David, Kevin (distributed) |
| Slide 3: Product definition          | 6:30–7:15  | Jiecong                             |
| Slide 4+5: Remaining work + timeline | 7:15–8:00  | David                               |
| Slide 6+8: Tech stack + architecture | 8:00–8:30  | David                               |
| Slide 7: MVP features summary        | 8:30–8:45  | Jiecong                             |
| Slide 9: Technical challenges        | 8:45–9:15  | Kevin                               |
| Slide 10: Contributions              | 9:15–9:30  | Kevin                               |
| Slide 11+12: Future + Q&A setup      | 9:30–10:00 | Kevin                               |

---

## Key Claims to Make

- OutfAI helps users make outfit decisions using clothes they already own
- The digital closet is the foundation — recommendations come from real wardrobe data
- Weather context filters out impractical items before scoring
- Mood input influences which styles and occasions are favored
- Scoring is rule-based and explainable, not a black box
- Save/skip/worn actions are logged for future preference learning
- The MVP demonstrates a complete loop: closet → context → suggestions → user decision

## Claims to Avoid

- Do not call the system "fully personalized" — preference learning is planned, not shipped
- Do not imply the AI is autonomous or deeply intelligent — it is structured heuristic scoring
- Do not claim the system "learns" from user behavior yet — it logs actions, learning is next phase
- Do not overstate image analysis — Google Vision integration is optional and supplementary

---

## Slide 1 — Title (0:00–0:30)

**Speaker: Jiecong**

"Hi everyone, we're Group 9. I'm Jiecong, and with me are David and Kevin.

We're presenting OutfAI — a wardrobe planning app that helps users decide what to wear using the clothes they already own, with AI-assisted outfit suggestions based on wardrobe data, weather, and mood.

We're going to walk through this as a user story. Imagine you're a student with a full closet but you still spend ten minutes every morning going back and forth about what to put on. Not because you don't have enough clothes, but because you have too many options and no good way to narrow them down. That's the problem OutfAI addresses.

We'll start with a live demo, then cover the product definition, technical details, and remaining work."

---

## Slide 2 — Demo (0:30–6:30)

**Presenter note:** Keep the DEMO slide on screen. The app is shown in the browser alongside.

---

### Step 1: Landing page (0:30)

**Action:** Jiecong opens `outfai.vercel.app` in browser.

**Speaker: Jiecong**

"This is OutfAI's landing page. A new visitor sees the core value proposition — organize your closet and get outfit suggestions from clothes you already own. There's a signup flow and sign-in option. We have an account pre-loaded with a wardrobe, so we'll go straight in."

---

### Step 2: Sign in (0:45)

**Action:** Click Sign in, enter prepared credentials, submit.

**Speaker: Jiecong**

"Standard login — we won't spend time on this. The account has about a dozen garments uploaded across different categories."

---

### Step 3: Location permission (1:00)

**Action:** Browser shows location permission popup. Click Allow.

**Speaker: David**

"The app is asking for location access. We use the browser's geolocation API to get coordinates, then call the Open-Meteo weather API to fetch current conditions and temperature. This weather data directly affects which garments are eligible for recommendations — the system maps the weather condition to allowed clothing seasons, and the temperature filters out inappropriate materials. Wool and fleece are excluded above 25 degrees, linen and silk below 10.

If a user denies location, there's a manual city input fallback that uses Open-Meteo's geocoding to resolve coordinates. The last-used city is also cached in localStorage."

---

### Step 4: Today page — outfit recommendations (1:30)

**Action:** Wait for the Today page to load. Scroll through the outfit card grid.

**Speaker: Jiecong**

"This is the Today page — the main screen of the app. What you see are outfit recommendations generated entirely from this user's own closet. Every top, bottom, and pair of shoes here is something the user actually uploaded."

**Speaker: Kevin**

"Let me explain what produced these results. The system took the full wardrobe, filtered out items that don't fit today's weather conditions, then assembled candidate outfit combinations — a top, a bottom, shoes, and optionally outerwear or accessories. Each combination was scored across multiple dimensions including color harmony, mood alignment, and style coherence. The top-scoring candidates are what you see here, each with a short explanation of why those pieces were grouped together."

---

### Step 5: Skip an outfit (2:20)

**Action:** Click Skip on one outfit card.

**Speaker: David**

"The user doesn't like this one, so they skip it. On the backend, that skip triggers a log entry in our recommendation logs table in Convex — it records the action type, the outfit's garment IDs, the current mood, and the weather context at that moment. Right now these logs are collected but not yet fed back into scoring. In our next phase, we plan to use accumulated skip and save patterns to adjust scoring weights per user, so the system gets better over time."

---

### Step 6: View outfit details and score breakdown (2:50)

**Action:** Click into an outfit card to expand / view details. Point out the score breakdown.

**Speaker: Kevin**

"When the user opens an outfit, they see each garment individually and an explanation of why this combination works — how the pieces relate to the selected mood and what makes them practical for today's conditions.

There's also a full score breakdown. The system scores across eight dimensions: a base of 50 points, then up to 20 for color harmony, 20 for mood alignment, 15 for style coherence, 12 for occasion matching, 8 for versatility, up to 10 for diversity, and up to 15 for user preferences when available. Only outfits scoring 60 or above make the cut.

This transparency is a deliberate design choice. If the user can see exactly why an outfit was recommended, they're more likely to trust it — and when something doesn't look right, we can trace it back to the scoring to understand why."

---

### Step 7: Save a look (3:30)

**Action:** Click Save Look.

**Speaker: Jiecong**

"The user likes this one, so they save it. One tap and it's in the archive. The idea is that the archive becomes a personal lookbook over time — instead of regenerating from scratch every day, the user can pull up combinations they already liked and reuse them."

---

### Step 8: Archive page (3:50)

**Action:** Navigate to Archive using bottom nav.

**Speaker: David**

"Here's the archive. Each saved outfit shows the garment thumbnails, the save date, and the original context — mood and weather at the time. There's also an 'I wore this' button. If the user actually wears a saved look, tapping that creates a 'worn' log entry in the backend. That's a stronger preference signal than a save — it means the user went from recommendation to real-world use. These different signal types — shown, saved, skipped, worn — are all structured consistently in our log schema, which is what we'll build preference learning on in the next phase."

---

### Step 9: Style insights (4:20)

**Action:** Go back to Today page. Scroll down and click View style insights. Show the modal briefly. Point out the Why this works link.

**Speaker: Kevin**

"Below the outfit grid, there's a style insights section. This is a separate rule-based service that analyzes the user's wardrobe and current outfits to surface practical tips. It checks for gaps — like if the wardrobe is heavy on casual tops but has no outerwear. It suggests complete-the-look additions and gives pairing tips based on the current mood and occasion context.

There's also a 'Why this works' page that breaks down a specific outfit's reasoning in more detail — the weather rationale, the mood alignment, and the styling logic all laid out.

Jiecong will now walk through adding a new garment, and David will explain the backend side."

---

### Step 10: Add a garment (5:00)

**Action:** Navigate to the Add page. Upload a prepared garment photo from the desktop. Select category (e.g., "top"), select color (e.g., "Black"). Click Add to closet.

**Speaker: Jiecong**

"Now the user wants to add a new piece to their closet. They go to the Add page, upload a photo, pick the category and color, and can optionally set style, fit, occasion, versatility, and vibrancy tags to give the recommendation engine more to work with."

**Speaker: David**

"On the backend, when that form submits, the image goes to Convex file storage and we get a storage reference. Then we write a garment document to our Convex database with all the metadata — name, category, primary color, tags, style, fit, occasion, versatility, vibrancy, material, season, and the image URL. Everything is scoped to the authenticated user's ID, so closets are private and persistent.

The garment is available immediately — the next time recommendations are generated, this new item is in the candidate pool. There's no batch step or delay. The recommendation service always queries the current closet state."

---

### Step 11: Shuffle — regenerate with updated closet (5:50)

**Action:** Navigate back to Today and click Shuffle.

**Speaker: Kevin**

"Now the user regenerates with the updated closet. When Shuffle is hit, the frontend sends a POST to our recommendation API with three inputs: the full garment list from Convex, the selected mood, and current weather conditions including temperature.

The recommendation service runs three stages. First, filtering — remove items that don't fit today's weather and temperature. Each weather condition maps to allowed seasons, and temperature thresholds exclude inappropriate materials.

Second, candidate generation — assemble outfit combinations by selecting one item from each required category: a top, a bottom, and shoes, with optional outerwear and accessories.

Third, scoring — each candidate is scored across the eight dimensions I described earlier, candidates below 60 are filtered out, the rest are sorted by score, and the top results are returned with human-readable explanations.

This is structured heuristic scoring, not a neural network. That's a deliberate MVP choice — it's explainable, predictable, and gives us a clear baseline. The interaction logs we're collecting now will eventually be the data source for smarter scoring in the next phase."

---

### Step 12: Demo wrap (6:20)

**Action:** Stop clicking. Pause.

**Speaker: Jiecong**

"That's the complete loop. Digital closet, weather-aware suggestions scored from real wardrobe items, browse and skip, save to archive, style insights, and new items feed right back into the next generation. The system explains its reasoning at every step, and every user action is logged for future improvement.

Now we'll walk through the product definition and remaining work."

---

## Slide 3 — Product Definition (6:30–7:15)

**Speaker: Jiecong**

"OutfAI is a wardrobe planning application. The core problem is that people spend more time than they should deciding what to wear, even when they own plenty of clothes. The wardrobe isn't the constraint — the decision process is.

Most people don't have a structured way to browse what they own or narrow down options by context. OutfAI addresses this by digitizing the closet and layering recommendation logic on top.

The MVP demonstrates that a user can upload their wardrobe, receive outfit suggestions that account for weather and mood, understand why those suggestions were made, and save looks for reuse — all in a short, low-friction flow.

Our product claims are specific:

- Recommendations use the user's real wardrobe items, not generic fashion content.
- Weather context filters out impractical items before scoring.
- Mood input shifts which styles and occasions are favored.
- Every recommendation comes with an explanation of why those items were selected together.
- User actions are logged as structured data for future preference learning.

We are not claiming the system is fully personalized today. Preference learning is planned for the next phase. What the MVP proves is that the core loop works: closet data in, context-aware suggestions out, user decision captured."

---

## Slide 4 — Remaining Work (7:15–7:40)

**Speaker: David**

"The MVP is functional end-to-end, but there are clear areas to improve.

Recommendation quality — the scoring works, but outfit coherence can be stronger. Better garment metadata and tighter compatibility rules will help. Right now if a user doesn't add detailed tags, the system has less to work with.

Preference learning — we already log every save, skip, and 'wore this' action with full context. The next step is actually feeding those signals back into the scoring weights so that recommendations improve with use. That's the biggest gap between MVP and a product that feels personal.

Wardrobe data quality — adding garments still requires some manual input for tags and attributes. We have optional image analysis through Google Vision, but making the default tagging smarter and reducing the user's input burden is important for adoption.

Saved outfit workflows — the archive works, but it needs filtering, search, and better reuse patterns. Right now it's a chronological list.

And then standard engineering work — onboarding clarity for new users, edge-case bugs, performance improvements, and UX consistency across all flows."

---

## Slide 5 — Timeline (7:40–8:00)

**Speaker: David**

"For the remaining semester — weeks 8 and 9, we focus on scoring calibration, outfit coherence improvements, and garment tagging quality. Weeks 10 and 11, we build the preference learning pipeline so interaction logs actually influence future results. Weeks 12 and 13, UX polish — archive usability, onboarding, responsive refinements. Week 14 is testing, bug fixes, performance, and final presentation prep."

---

## Slide 6 + 8 — Tech Stack and Architecture (8:00–8:30)

**Speaker: David**

"For the tech stack — the frontend is Next.js with React and TypeScript. We chose Next.js for server-side rendering support and strong typing with TypeScript across the project.

The backend is Convex. Convex handles our database, file storage, and real-time data in one platform. That means garment data, outfit records, and recommendation logs all live in Convex, and we don't maintain a separate REST API layer for data access — Convex queries and mutations handle it directly.

Authentication uses Better Auth, integrated through Convex. Weather data comes from the Open-Meteo API — it's free, doesn't require an API key, and gives us current conditions and temperature from coordinates or city name. We also have optional Google Vision API integration for analyzing garment images, though it's supplementary and not required for the core flow.

Everything is deployed on Vercel. We have CI set up on GitHub running format, lint, typecheck, test, and build checks.

Architecture-wise, the data flow is: user interacts with the Next.js frontend, the frontend reads and writes to Convex for closet data, outfit records, and logs. When recommendations are requested, the frontend calls our recommendation API route, which invokes the OutfitRecommendationService. That service queries the user's garments, filters by weather, generates candidates, scores them, and returns the results. External calls go to Open-Meteo for weather and optionally to Google Vision for image analysis."

---

## Slide 7 — MVP Features Summary (8:30–8:45)

**Speaker: Jiecong**

"Quick summary of what's working in the MVP today.

Digital closet — garments stored with photo, category, color, tags, and additional attributes like style, fit, occasion, versatility, and vibrancy. Filterable grid view.

Weather context — auto-detected from location, or manual city fallback. Used to filter out season- and temperature-inappropriate items before scoring.

Mood input — seven options that map to style tags and occasion preferences in the scoring pipeline.

Outfit generation — candidate assembly from user's own items, scored across eight dimensions, minimum threshold of 60 points, returned with explanations.

Save, skip, and archive — all actions logged. Archive stores saved looks for reuse with 'I wore this' logging.

Style insights — wardrobe gap analysis, complete-the-look suggestions, and pairing tips.

Explainability — score breakdowns and human-readable reasoning for every recommendation."

---

## Slide 9 — Technical Challenges and Design Decisions (8:45–9:15)

**Speaker: Kevin**

"A few technical decisions and challenges worth mentioning.

First, garment data representation. Each garment carries category, color, tags, style, fit, occasion, versatility, vibrancy, material, and season. That's a lot of attributes, and users don't always fill them in. We added default tag generation based on category and color to fill gaps, but richer metadata means better recommendations, so there's a tension between user convenience and data quality.

Second, outfit composition. We don't just randomly pair items. Candidate generation enforces category coverage — you need a top, a bottom, and shoes at minimum. Outerwear and accessories are added when present and contextually appropriate. Without these constraints, you'd get combinations like a blazer with gym shorts, which technically come from the user's closet but aren't useful.

Third, multi-dimensional scoring. We score across eight dimensions. The hard part is weighting them so no single factor dominates. Color harmony could overwhelm mood alignment if not calibrated. We went through several iterations to get the balance to a point where results feel coherent across different moods and weather conditions.

Fourth, weather as a pre-filter rather than a scoring dimension. Early on we tried including weather as a score factor, but it created awkward results — an outfit would get a high score but still include a wool sweater on a hot day. Moving weather to a filter stage before scoring cleaned this up. If an item isn't appropriate for today's conditions, it's just not in the candidate pool.

Fifth, the decision to stay rule-based for the MVP. We could have tried to build a model, but with limited training data and a small user base, structured heuristics give us predictable, explainable results. Every score can be traced back to specific garment attributes and context inputs. That makes debugging straightforward and gives users a reason to trust the output. The interaction logs we're collecting now will be the training data for a smarter system later."

---

## Slide 10 — Team Contributions (9:15–9:30)

**Speaker: Kevin**

"For contributions —

David led backend architecture, Convex integration, the recommendation service and scoring pipeline, API routes, CI setup, and implementation planning.

I worked on recommendation logic refinement, mood-to-style and mood-to-occasion mapping, scoring calibration, testing, and the score breakdown UI integration.

Jiecong led frontend development across all pages — the landing page, authentication flow, closet and add garment UI, the Today page layout, archive, weather integration with the manual fallback, navigation, and the overall demo flow and user journey."

---

## Slide 11 — Future Development (9:30–9:40)

**Speaker: Kevin**

"Beyond what's left for the capstone, longer-term directions include:

Preference learning — using accumulated save, skip, and worn logs to adjust scoring weights per user. Smarter garment tagging through image analysis to reduce manual input. An outfit calendar so users can plan ahead by date. Wardrobe usage analytics — how often items are used, what's underutilized, seasonal rotation suggestions. And eventually a stronger mobile-first experience."

---

## Slide 12 — Q&A Setup (9:40–10:00)

**Speaker: Kevin**

"We're set up for questions. We'll keep the demo app open so we can show anything live.

For question routing — Jiecong covers frontend and user experience, David covers backend, data, and architecture, and I cover recommendation logic and scoring.

Happy to take questions."

---

## Q&A Backup Answers

**How does the recommendation engine work?**  
Filter garments by weather/temperature → generate candidate outfit combinations (top + bottom + shoes, optional outerwear/accessories) → score each candidate across 8 dimensions (base, color harmony, mood alignment, style coherence, occasion matching, versatility, diversity, preferences) → filter out scores below 60 → return top results with explanations.

**What makes this "AI-assisted"?**  
Structured heuristic scoring across multiple dimensions with rule-based filtering, context-aware candidate generation, and automated explanation generation. It's not a neural model. We chose this deliberately for explainability and predictability. The interaction logs we collect will support ML-based improvements later.

**How does weather affect suggestions?**  
Weather condition maps to allowed seasons (e.g., rainy → spring/fall/winter/all-season). Temperature filters materials (no wool above 25°C, no linen below 10°C). Items that don't pass are excluded before scoring starts.

**How does mood affect scoring?**  
Each mood maps to a set of style tags (e.g., casual → cotton, denim, relaxed) and occasion preferences (e.g., casual → casual, weekend). During scoring, garments whose tags or occasions match the mood mapping receive bonus points for mood alignment and occasion matching.

**How are garments stored?**  
Convex database, per-user. Fields: name, category, primaryColor, tags, style, fit, occasion, versatility, vibrancy, material, season, imageUrl. Images in Convex file storage. Indexed by userId.

**What if location is unavailable?**  
Manual city input field appears. Open-Meteo geocoding resolves the city to coordinates, then fetches weather. Last-used city is cached in localStorage.

**What are the scoring dimensions?**  
Base (50), color harmony (0–20), mood alignment (0–20), style coherence (0–15), occasion matching (0–12), versatility (0–8), diversity (5–10), preferences (0–15). Total range 50–100, minimum 60 to show.

**Why rule-based instead of ML?**  
Limited training data at MVP stage, small user base, need for explainability, and debuggability. Every score is traceable to specific garment attributes. Interaction logs being collected now will be training data for future ML-based ranking.

**What are the current limitations?**  
Recommendation quality depends on garment metadata quality — sparse tags mean less to score against. No preference learning yet — logs are collected but not fed back. Archive lacks search/filtering. Onboarding could be clearer for first-time users.

---

## Integrated Demo Runbook

### Pre-Demo Setup (T-10 minutes)

**Who shares screen:** Jiecong  
**Browser:** Clean Chrome profile, no cookies, no cached location permission  
**URL:** `outfai.vercel.app`

**Account requirements:**

- [ ] Demo account pre-created and verified
- [ ] Closet contains 8–12 garments across categories (tops, bottoms, shoes, outerwear, at least one accessory)
- [ ] At least one saved outfit already in archive (so archive isn't empty)
- [ ] No pending toasts or error states

**Desktop prep:**

- [ ] One garment photo saved to desktop for upload step (clear photo of a clothing item)
- [ ] Browser window sized appropriately for screen share
- [ ] Close all unrelated tabs, apps, and notifications
- [ ] Silence phone notifications

**Network:**

- [ ] Verify internet stability
- [ ] Test that outfai.vercel.app loads

**Location permission:**

- [ ] Reset site permissions so the location prompt will appear during demo
- [ ] If permission reset isn't possible, have manual city name ready

**Backup:**

- [ ] Second demo account credentials accessible (in case primary account has issues)
- [ ] Know the manual weather city name to type if geolocation fails

### Primary Demo Path

| Step | Action                                                              | Who clicks | Who speaks      | Time |
| ---- | ------------------------------------------------------------------- | ---------- | --------------- | ---- |
| 1    | Open outfai.vercel.app                                              | Jiecong    | Jiecong         | 0:30 |
| 2    | Click Sign in, enter credentials, submit                            | Jiecong    | Jiecong         | 0:45 |
| 3    | Click Allow on location permission                                  | Jiecong    | David           | 1:00 |
| 4    | Scroll through outfit grid on Today page                            | Jiecong    | Jiecong → Kevin | 1:30 |
| 5    | Click Skip on one outfit card                                       | Jiecong    | David           | 2:20 |
| 6    | Click into outfit details + score breakdown                         | Jiecong    | Kevin           | 2:50 |
| 7    | Click Save Look                                                     | Jiecong    | Jiecong         | 3:30 |
| 8    | Navigate to Archive                                                 | Jiecong    | David           | 3:50 |
| 9    | Go to Today → View style insights → Why this works                  | Jiecong    | Kevin           | 4:20 |
| 10   | Navigate to Add → upload photo → set category/color → Add to closet | Jiecong    | Jiecong → David | 5:00 |
| 11   | Go to Today → click Shuffle                                         | Jiecong    | Kevin           | 5:50 |
| 12   | Stop clicking. Wrap demo verbally.                                  | —          | Jiecong         | 6:20 |

### Things to Avoid During Demo

- Don't linger on login/signup screens
- Don't click into profile or settings (not core to the demo story)
- Don't try to delete garments live (risky, not part of the story)
- Don't click theme toggle (confusing visual change mid-demo)
- Don't scroll past the main content into the footer or empty sections

### Contingency Plans

**Login fails:** Switch to backup account. Say "We'll use our pre-loaded account."

**Location prompt doesn't appear:** Type a city name in the manual fallback input. Say "If location isn't available, the user can enter a city manually."

**Recommendations are slow to load:** Navigate to Archive and Style Insights while waiting. Say "While that generates, let's look at the archive." Return when results appear.

**Garment upload fails:** Point to existing closet items. Say "This is the same flow that produced the items already in the closet."

**Score breakdown doesn't expand:** Describe it verbally from the slide content. Say "The score breaks down into color harmony, mood alignment, style coherence, and several other factors."

### Q&A-Safe Resting Screen

Stay on the DEMO slide with the app visible in the browser on the Today page. This lets the team show anything live if asked.

---

## Summary of Changes from Previous Version

- Distributed demo speaking lines evenly: Jiecong (steps 1, 2, 4 intro, 7, 10 UI, 12), David (steps 3, 5, 8, 10 backend), Kevin (steps 4 main, 6, 9, 11)
- Reframed OutfAI as "wardrobe planning app with AI-assisted recommendations" instead of "AI-powered outfit recommendation system"
- Grounded all technical claims in actual codebase: 8 scoring dimensions with specific point ranges, weather filtering logic, mood-to-tag mappings
- Made the recommendation engine description accurate: filter → generate → score → rank, rule-based heuristics, not neural
- Clearly separated what works in MVP from what is planned
- Removed overclaiming about personalization — logs are collected, learning is not yet implemented
- Made remaining work and timeline sound like a real sprint plan, not a corporate roadmap
- Expanded technical challenges section with actual design decisions (weather as filter vs. score, why rule-based)
- Added claims-to-avoid section to prevent presentation mistakes
- Deepened demo narration to explain why each feature matters, not just what it does
- Integrated demo runbook with practical operational details

## Estimated Runtime

- Intro: ~30 seconds
- Demo: ~5:50
- Slides 3–12: ~3:40
- **Total: ~10:00**

## Assumptions Made

- Google Vision integration is optional and not critical to the demo flow (confirmed in feature status)
- Style insights service is rule-based, not ML (confirmed in codebase)
- Preference learning is not shipped — only the logging infrastructure exists (confirmed)
- Score breakdown UI exists and is expandable in the outfit card (confirmed in shipped features)
- Manual weather fallback via city input is working (confirmed in Phase 1 shipped features)
