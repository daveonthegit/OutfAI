# OutfAI — Tech Stack

> Technologies in use and where they apply. See [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) for architecture.

---

| Layer        | Stack                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript                             |
| **Styling**  | Tailwind CSS 4, Radix UI, "cybersigilism" design system                   |
| **API**      | Convex (queries/mutations) + Next.js API routes                           |
| **Backend**  | Convex (database, server functions, auth, file storage)                   |
| **Auth**     | BetterAuth 1.4.9 (email/password, username plugin, stored in Convex)      |
| **Storage**  | Convex file storage (garment and profile images)                          |
| **Weather**  | Open-Meteo (client-side from home; optional server-side cache in roadmap) |
| **Email**    | Resend (verification, password reset)                                     |
| **Optional** | Google Cloud Vision (garment image analysis), R2/S3 for future            |

---

## Key paths

- **Schema:** `convex/schema.ts` — single source of truth; [convex-schema.md](../convex-schema.md) is generated.
- **DB design:** [OutfAI_Database_Design.md](../OutfAI_Database_Design.md).
- **Design system:** [style.md](../style.md) and live `/style` page in the app.
