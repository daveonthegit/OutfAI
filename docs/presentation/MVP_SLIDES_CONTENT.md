# OutfAI — MVP Presentation Slide Content

Group 9 · Hunter College · CSCI 499 · MVP Demo · Spring 2026

This file contains the text that goes on each slide. Speaker content is in MVP_SCRIPT.md.

---

## Slide 1 — Title

**OutfAI**  
AI-Assisted Wardrobe Planning

David Xiao · Kevin Ye · Jiecong Wu Wu

Hunter College · CSCI 499 · MVP Demo · Spring 2026

---

## Slide 2 — Demo

**DEMO**

---

## Slide 3 — Product Definition

**What is OutfAI?**  
A wardrobe planning app that helps users make better outfit decisions using the clothes they already own, with AI-assisted recommendations informed by wardrobe data, weather context, and user intent.

**Problem**  
Users spend disproportionate time choosing outfits, even with full wardrobes. Clothes go underused because they are not organized or surfaced effectively.

**Who is it for?**  
Anyone with an existing wardrobe who wants to reduce daily outfit friction — students, commuters, busy professionals.

**What the MVP proves**  
A user can digitize their closet, receive context-aware outfit suggestions from their own items, and save a usable look in a short, low-friction flow.

**System flow**  
Wardrobe Data + Weather + Mood → Recommendation Engine → Scored Outfit Suggestions → User Decision (save / skip)

---

## Slide 4 — Remaining Work

**Recommendation quality**  
Improve outfit coherence through better garment metadata, stronger compatibility rules, and richer scoring calibration.

**Feedback-driven personalization**  
The MVP already logs save/skip/worn actions. Next step: feed those signals back into scoring so recommendations improve with use.

**Wardrobe data quality**  
Better tagging support, smarter defaults, and optional image-based attribute detection to reduce manual input.

**Saved outfit workflows**  
Richer archive: filtering, search, seasonal grouping, and easier reuse of past looks.

**UX and stability**  
Onboarding clarity for new users, responsive polish, loading state improvements, edge-case bug fixes, and performance hardening.

---

## Slide 5 — Timeline (Remaining Semester)

- **Week 8–9:** Scoring calibration, outfit coherence rules, garment tagging improvements
- **Week 10–11:** Preference learning from interaction logs (save/skip/worn → scoring weight adjustments)
- **Week 12–13:** Archive usability, onboarding flow, UI/UX polish
- **Week 14:** End-to-end testing, bug fixes, performance, final presentation prep

---

## Slide 6 — Tools / Technologies

- **Frontend:** Next.js, React, TypeScript
- **Backend + Data:** Convex (queries, mutations, file storage, real-time sync)
- **Authentication:** Better Auth (via Convex)
- **Weather:** Open-Meteo API (geolocation + manual city fallback)
- **Optional image analysis:** Google Vision API
- **Deployment:** Vercel
- **Source control:** GitHub with documented issues and CI (lint, typecheck, test, build)

---

## Slide 7 — MVP Core Features (What Works Today)

**Digital closet**  
Upload garments with photo, category, color, tags, style, fit, occasion, versatility, vibrancy. Browse and filter the closet grid.

**Weather-aware context**  
Auto-detect location for live weather, or manually enter a city. Weather filters out seasonally and temperature-inappropriate items before scoring.

**Mood input**  
Seven mood options (casual, formal, adventurous, cozy, energetic, minimalist, bold) that influence which garment tags and occasions are favored.

**Outfit generation**  
Candidate outfits are assembled from user's closet items and scored across eight dimensions. Top results (score ≥ 60) are returned with explanations.

**Save / skip / archive**  
Save a look to archive for reuse. Skip to dismiss. Log "I wore this" on past outfits. All actions are recorded for future preference learning.

**Style insights**  
Rule-based analysis of wardrobe gaps, complete-the-look suggestions, and pairing tips based on current outfit and mood.

**Explainability**  
Every outfit includes a score breakdown (color harmony, mood alignment, style coherence, occasion matching, versatility, diversity) and a human-readable explanation.

---

## Slide 8 — System Architecture

```
User (browser)
    |
    v
Next.js Frontend (React + TypeScript)
    |
    v
Convex Backend (queries, mutations, file storage)
    |
    +---> Garments collection (per-user closet data)
    +---> Outfits collection (saved looks)
    +---> Recommendation logs (save/skip/worn actions)
    |
    v
Recommendation API (POST /api/recommendations)
    |
    +---> OutfitRecommendationService
    |       - Filter garments by weather/temperature
    |       - Generate candidate combinations
    |       - Score across 8 dimensions
    |       - Return top results with explanations
    |
    +---> Open-Meteo API (weather context)
    +---> Google Vision API (optional image analysis)
```

---

## Slide 9 — Technical Challenges / Design Decisions

**Garment data representation**  
Each garment carries category, color, tags, style, fit, occasion, versatility, vibrancy, material, and season. Getting useful metadata without burdening the user required sensible defaults and optional auto-fill.

**Outfit composition logic**  
Candidate generation builds top + bottom + shoes combinations with optional outerwear and accessories. Random pairing would produce incoherent results, so we enforce category coverage and compatibility constraints before scoring.

**Multi-dimensional scoring**  
Eight scoring dimensions (base, color harmony, mood alignment, style coherence, occasion matching, versatility, diversity, preferences). Balancing these so no single factor dominates required iterative calibration.

**Weather as a filter, not a score**  
Weather and temperature filter out inappropriate items before scoring starts (e.g., no wool above 25°C, no linen below 10°C). This keeps the scoring pipeline focused on style decisions.

**Rule-based, not black-box**  
Current recommendation logic is structured heuristics, not a neural model. This is a deliberate MVP choice: it produces explainable results, is predictable, and gives us a clear baseline to improve against.

---

## Slide 10 — Team Contributions

**David Xiao**

- Backend architecture and Convex integration
- Recommendation service and scoring pipeline
- Data persistence, API routes, CI setup
- Implementation planning and feature development

**Kevin Ye**

- Recommendation logic refinement and scoring calibration
- Mood-to-style/occasion mapping
- Feature testing and edge-case analysis
- Score breakdown UI support

**Jiecong Wu Wu**

- Frontend UI/UX across all pages
- Landing page, authentication flow, navigation
- Weather integration and manual fallback UX
- End-to-end user journey and demo flow

---

## Slide 11 — Future Development (Beyond Capstone)

- Preference learning pipeline using accumulated interaction logs
- Smarter garment tagging via image analysis
- Outfit calendar for advance planning
- Wardrobe usage analytics (rotation tracking, gap identification)
- Mobile-first responsive experience
- Closet search and advanced filtering

---

## Slide 12 — Anticipated Technical Questions

**How does the recommendation engine work?**  
Filter garments by weather → generate candidate outfit combinations → score each across 8 dimensions → return top results (≥60 points) with explanations.

**What makes this "AI-assisted"?**  
Structured heuristic scoring across multiple dimensions with rule-based filtering and explanation generation. Not a neural model — deliberate choice for explainability and predictability in MVP.

**How does weather affect suggestions?**  
Weather condition and temperature filter garments before scoring. Season-inappropriate and temperature-inappropriate items are excluded (e.g., outerwear excluded above 25°C).

**How are garments stored?**  
Convex database with per-user documents: name, category, color, tags, style, fit, occasion, versatility, vibrancy, material, season, image URL. Images in Convex file storage.

**What happens when location is unavailable?**  
Manual city input fallback using Open-Meteo geocoding. Last-used city cached in localStorage.

**How could recommendations improve over time?**  
Save/skip/worn logs are already recorded with full context. Next phase: use these signals to learn user preferences and adjust scoring weights.
