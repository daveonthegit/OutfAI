# OutfAI — Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** OutfAI  
**Category:** AI-assisted wardrobe & outfit planning  
**Stage:** Capstone MVP → Startup-viable MVP  
**Primary Platform:** Web (React / TypeScript)  
**Secondary (future):** Mobile (React Native / Expo)

### One-line Value Proposition

OutfAI helps users decide what to wear by generating **context-aware outfits from their own wardrobe**, using mood and weather, while **optionally suggesting new pieces that actually fit what they already own**.

---

## 2. Problem Statement

People experience **decision fatigue** when choosing outfits, even though they already own enough clothing. This problem is intensified by:

- Large, underutilized wardrobes
- Changing daily context (mood, weather, occasion)
- Poor mental visibility of how pieces combine

Existing fashion apps often:

- Push shopping first
- Require heavy manual setup
- Offer opaque or unexplainable recommendations
- Treat the user’s closet as secondary to catalogs

OutfAI is designed to solve this by being **wardrobe-first**, explainable, and context-aware.

---

## 3. Target Users

### Primary Personas

**Students & Young Adults**

- Need fast, low-effort outfit decisions
- Budget-conscious
- High decision fatigue

**Busy Professionals**

- Care about weather, dress codes, reliability
- Want repeatable “safe” outfits
- Value time saved

**Fashion-Interested but Overwhelmed Users**

- Own many clothes but feel they “have nothing to wear”
- Want inspiration without overconsumption

---

## 4. Product Strategy (Research-Informed)

**Positioning:**

> Wardrobe-first intelligence with optional, context-aware commerce

Principles:

- The user’s closet is the system of record
- Shopping is additive, not primary
- Every suggested purchase must justify how it fits into the existing wardrobe

---

## 5. Goals and Non-Goals

### Goals (MVP)

- Reduce daily outfit decision time
- Increase utilization of existing wardrobe items
- Produce relevant, trustworthy outfit recommendations
- Build user trust through explainability

### Non-Goals (MVP)

- Virtual try-on or avatars
- Full trend prediction systems
- Scraping retailer websites
- Becoming a shopping-first app

---

## 6. Core Features (MVP)

### 6.1 Closet Management

- Upload clothing photos
- Categorize items (tops, bottoms, shoes, accessories)
- Auto-tagging with manual correction

### 6.2 Mood Input

- Emoji, slider, or short text
- Mood mapped to style tags
- No psychological profiling

### 6.3 Weather Integration

- Live weather API
- Weather-based constraints
- Weather displayed in UI

### 6.4 Outfit Recommendation Engine

- Generates full outfits
- Rule-based constraints (weather, category compatibility)
- Simple scoring logic
- Explainable reasoning shown to user

---

## 7. Storefront Integration (Optional)

### Philosophy

OutfAI suggests new items **only when they complement the user’s existing wardrobe**.

### Requirements

- Suggestions appear after wardrobe-based outfits
- Each item includes a justification
- Clear labeling as external products
- Affiliate or partner feeds only

---

## 8. User Flow

1. Open app
2. Upload or select closet items
3. Select mood
4. Weather auto-detected
5. Generate outfits
6. View outfit options
7. Optional shuffle, save, swap, or shop

---

## 9. Success Metrics

**MVP Metrics**

- Time to first outfit
- Weekly outfits generated
- Outfit saves vs reshuffles
- Shopping click-through (secondary)

**Long-Term Metrics**

- Retention
- Closet utilization
- Repeat wear events

---

## 10. Technical Scope (High-Level)

**Frontend:** React + TypeScript  
**Backend:** Node.js + TypeScript  
**Database:** Relational (users, garments, outfits)  
**APIs:** Weather, image recognition (optional), affiliate feeds

---

## 11. Roadmap

### MVP

- Closet upload
- Mood + weather input
- Rule-based recommendations
- Optional storefront suggestions

### Post-MVP

- Learning from feedback
- Outfit history and calendar
- Packing and occasion planning
- Smarter ranking models
- Retail partnerships

---

## 12. Differentiation

- Wardrobe-first, not shopping-first
- Context-aware (mood + weather)
- Explainable recommendations
- Compliance-safe commerce strategy
- Focused on reducing overconsumption

---

**OutfAI turns outfit selection from a daily stressor into a simple, confident decision.**
