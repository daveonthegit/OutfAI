# OutfAI — Local Setup

> How to run the project locally. See also root [README.md](../../README.md).

---

## Prerequisites

- **Node.js** 20+
- **npm**
- Free **[Convex](https://convex.dev)** account

---

## Steps

### 1. Clone and install

```bash
git clone https://github.com/daveonthegit/OutfAI.git
cd OutfAI
npm install
```

### 2. Initialize Convex (first time only)

```bash
npx convex dev
```

Log in or create a Convex account; this writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.

### 3. Set auth secrets in Convex

```bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:3000
```

### 4. Local env

```bash
cp .env.example .env.local
```

Fill in:

| Variable                         | Value                                                       |
| -------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_SITE_URL`    | Same as `NEXT_PUBLIC_CONVEX_URL` but domain ends in `.site` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Google Cloud Vision JSON (optional)                 |

### 5. Run (two terminals)

**Terminal 1 — Convex:**

```bash
npm run convex:dev
```

**Terminal 2 — Next.js:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any username/password; account is created on first sign-in.

---

## Scripts

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Next.js dev server (Turbopack)     |
| `npm run convex:dev`    | Convex dev server                  |
| `npm run convex:deploy` | Deploy Convex to production        |
| `npm run build`         | Production build                   |
| `npm run gen:db-docs`   | Regenerate `docs/convex-schema.md` |
| `npm run typecheck`     | TypeScript check                   |
| `npm run lint`          | ESLint                             |
| `npm run test`          | Vitest unit tests                  |
