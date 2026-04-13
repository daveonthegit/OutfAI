# Scraping: Non-Goal and High-Risk

**OutfAI PRD states that scraping retailer websites is a non-goal.** This document explains why and how to source product data safely.

## PRD alignment

- **OutfAI_PRD.md § Non-Goals (MVP):** “Scraping retailer websites”
- **OutfAI_PRD.md §7 Storefront Integration:** “Affiliate or partner feeds only”

The production path for external product data is **affiliate and partner APIs/feeds only**. Scraping must not be the default or hidden production source.

## Legal and ToS

- Many retailers prohibit scraping in their Terms of Service. Unauthorized scraping can create legal liability.
- Before considering any scraping: review the target site’s ToS and robots.txt, and get legal input.
- Prefer structured data (official APIs, JSON-LD, partner feeds) over parsing HTML.

## Technical and ethical considerations

- **robots.txt and rate limits:** If scraping were ever used in a non-production experiment, respect robots.txt and apply strict rate limits.
- **Fragility:** Parsed fields (name, category, color, price, image) break when markup changes; expect high maintenance.
- **User-agent and load:** Use a clear, identifiable user-agent and avoid overloading servers.

## Preference order

1. **Structured data / official APIs** — Partner or retailer APIs, affiliate network product feeds.
2. **JSON-LD / schema.org** — When present on product pages.
3. **Scraping** — Not the production path; if explored at all, keep it isolated, documented as high-risk, and never the default data source.

## Implementation

- Product data in OutfAI is supplied via **provider adapters** (e.g. `server/commerce/providers/`).
- The **mock provider** is used when no affiliate/partner credentials are configured.
- No production code in this repo implements retailer scraping. Any future experimental scraping must be clearly isolated and documented as non-default and high-risk.
