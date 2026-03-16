# OutfAI Documentation

> Overview of the documentation and where to find things.

---

## New developers

1. **What the product does** — [OutfAI_PRD.md](./OutfAI_PRD.md) (vision and strategy); [implementation/FEATURE_STATUS.md](./implementation/FEATURE_STATUS.md) (what’s shipped vs planned).
2. **How the system works** — [architecture/SYSTEM_OVERVIEW.md](./architecture/SYSTEM_OVERVIEW.md), [architecture/TECH_STACK.md](./architecture/TECH_STACK.md), [OutfAI_Database_Design.md](./OutfAI_Database_Design.md).
3. **What features exist** — [implementation/FEATURES_CANONICAL.md](./implementation/FEATURES_CANONICAL.md).
4. **What still needs to be implemented** — [implementation/FEATURE_STATUS.md](./implementation/FEATURE_STATUS.md) (Not shipped), [implementation/ROADMAP.md](./implementation/ROADMAP.md), [implementation/EXPANSION_ROADMAP.md](./implementation/EXPANSION_ROADMAP.md).
5. **How to contribute** — [dev/SETUP.md](./dev/SETUP.md), [dev/CONTRIBUTING.md](./dev/CONTRIBUTING.md), [dev/PATTERNS.md](./dev/PATTERNS.md).

---

## Structure

| Directory / file                 | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| **architecture/**                | System overview, tech stack                                      |
| **implementation/**              | Feature status, canonical feature list, roadmap, phase summaries |
| **product/**                     | Current product state, gaps, feature expansion                   |
| **dev/**                         | Setup, contributing, coding patterns                             |
| **security/**                    | Security practices summary                                       |
| **commerce/**                    | Commerce/storefront implementation, providers                    |
| **frontend/**                    | Frontend-specific docs (e.g. animations)                         |
| **issues/**                      | Per-issue specs (01–33) for backlog and GitHub                   |
| **project/**                     | GitHub issues structure, phase sync                              |
| **convex-schema.md**             | Auto-generated schema reference (run `npm run gen:db-docs`)      |
| **OutfAI\_\*.md**                | PRD, architecture, database design, project structure            |
| **style.md**                     | Design system reference                                          |
| **cicd.md**                      | CI/CD pipeline                                                   |
| **landing-and-public-routes.md** | Landing and no-nav routes                                        |

---

## Key canonical docs

- **Feature status (shipped vs not):** [implementation/FEATURE_STATUS.md](./implementation/FEATURE_STATUS.md)
- **Canonical feature list:** [implementation/FEATURES_CANONICAL.md](./implementation/FEATURES_CANONICAL.md)
- **Roadmap:** [implementation/EXPANSION_ROADMAP.md](./implementation/EXPANSION_ROADMAP.md)
- **Product state:** [product/CURRENT_PRODUCT_STATE.md](./product/CURRENT_PRODUCT_STATE.md)

Patterns and rules live in the repo **`rules/`** directory (see [dev/PATTERNS.md](./dev/PATTERNS.md)).
