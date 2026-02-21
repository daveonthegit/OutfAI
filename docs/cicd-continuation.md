# CI/CD Setup — Continuation Context

> Created: 2026-02-20
> Purpose: Resume context for completing the CI/CD pipeline setup.

## What was completed

### Files created

| File | Status | Notes |
|------|--------|-------|
| `.editorconfig` | Done | LF line endings, 2-space indent |
| `.prettierrc` | Done | Consistent formatting config |
| `.prettierignore` | Done | Ignores node_modules, .next, generated docs |
| `eslint.config.mjs` | **Needs work** | Config runs but ~1300 errors remain from existing code |
| `vitest.config.ts` | Done | Monorepo path aliases, covers tests/, server/, shared/, apps/web/ |
| `.lintstagedrc.json` | Done | prettier + eslint on staged files |
| `.husky/pre-commit` | Done | Runs lint-staged |
| `.github/workflows/ci.yml` | Done | 9 jobs: setup, format-check, lint, typecheck, test, build, prisma, docs-consistency, security-baseline |
| `.github/workflows/preview.yml` | Done | Vercel CLI preview deploy + PR comment |
| `.github/workflows/release.yml` | Done | Tag-triggered, CI gate, Vercel prod deploy, GitHub Release |
| `docs/cicd.md` | Done | Full CI/CD documentation |
| `rules/cicd-rules.mdc` | Done | Cursor rule for enforcing CI conventions |
| `tests/services/outfitRecommendationService.test.ts` | Done | 11 tests, all passing |
| `package.json` | Done | All scripts added (format, lint, typecheck, test, build, prisma:*, db:doc, ci, prepare) |

### Dependencies installed

```
eslint @eslint/js typescript-eslint prettier vitest husky lint-staged prisma tsx
```

### Verified working

| Check | Result |
|-------|--------|
| `npm run test` (vitest) | 11/11 passing |
| `npm run typecheck` (tsc --noEmit) | Clean — 0 errors |
| `npm run format` (prettier --write .) | Applied to all 133 files |
| `npm run format:check` | Passes after format |
| `npm run build` | Not verified yet |

### Bug fixed during setup

`server/services/outfitRecommendationService.ts` — the `generateCandidates` method passed a partial "barefoot" placeholder object (`{ id: "barefoot", category: "shoes" }`) to `scoreOutfit`, which crashed `scoreColorHarmony` because it lacked `primaryColor`. Fixed by filtering the placeholder out before passing to scoring functions.

## What still needs work

### 1. ESLint errors (~1304 errors, 9402 warnings)

**Root cause:** The existing codebase was never linted. Most errors come from:

| Rule | Approx count | Source |
|------|-------------|--------|
| `no-constant-condition` | ~450 | shadcn/ui patterns, bundled library code |
| `no-useless-assignment` | ~250 | shadcn/ui patterns |
| `no-unsafe-finally` | ~84 | shadcn/ui bundled code |
| `@typescript-eslint/ban-ts-comment` | ~80 | `@ts-ignore` in existing code |
| `no-cond-assign` | ~100 | shadcn/ui patterns |
| `@typescript-eslint/no-this-alias` | ~50 | shadcn/ui bundled code |

**What's already been done:**
- `apps/web/components/ui/` is ignored in ESLint (shadcn generated code)
- `no-undef` is disabled (TypeScript handles this)
- `no-unused-expressions` set to warn with allowShortCircuit/allowTernary
- `no-constant-binary-expression`, `no-prototype-builtins`, `no-constant-condition` set to warn

**Options to resolve:**
1. **Option A (recommended):** Identify which files produce errors — they're likely from bundled/vendor-like code in node_modules output or deeply nested shadcn patterns. Add those paths to ESLint `ignores`.
2. **Option B:** Downgrade remaining error-level rules to warnings for now, tighten later.
3. **Option C:** Run `eslint --fix` on safe auto-fixable rules, manually fix the rest.

**Goal:** `npm run lint` should exit 0 (only warnings, no errors) so CI passes.

### 2. Build verification

`npm run build` (Next.js build) has not been tested yet. It may surface additional issues.

### 3. Line ending normalization

Git shows many CRLF→LF warnings. Consider adding a `.gitattributes` file:

```
* text=auto eol=lf
```

### 4. Husky initialization

Husky was installed and `.husky/pre-commit` was created, but `npx husky` may need to be run once to initialize the git hooks directory. Run:

```bash
npx husky
```

### 5. GitHub secrets setup

Before preview/release workflows work, these secrets must be added to the GitHub repo:

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Run `vercel link`, then check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same as above |

Also create a `production` GitHub Environment with required reviewers for the release workflow.

## Resume checklist

When continuing this work:

1. [ ] Fix ESLint to exit 0 — resolve or suppress remaining ~1304 errors
2. [ ] Verify `npm run build` passes
3. [ ] Add `.gitattributes` for LF normalization
4. [ ] Run `npx husky` to initialize git hooks
5. [ ] Run full `npm run ci` meta-script end to end
6. [ ] Test that the CI workflow YAML is valid (push to a branch and check Actions tab)
7. [ ] Set up Vercel project and add GitHub secrets
8. [ ] Verify preview workflow on a test PR
