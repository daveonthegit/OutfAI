# Update implementation-plan and commit-plan for Convex

**Labels:** `documentation`, `chore`

## Description

implementation-plan and commit-plan (Supabase/Prisma/tRPC) were **removed**. Current stack and backlog: [MASTER_PLAN.md](../MASTER_PLAN.md), [implementation/FEATURE_STATUS.md](../implementation/FEATURE_STATUS.md), [implementation/EXPANSION_ROADMAP.md](../implementation/EXPANSION_ROADMAP.md).

## Tasks

- [ ] Either: Rewrite implementation-plan phases to Convex/BetterAuth (Phase 0 = Convex schema + auth already done; list remaining phases).
- [ ] Or: Add a prominent "Superseded" notice at the top of both docs with a link to MASTER_PLAN.md and profile-and-account-settings-issues.md for remaining work.
- [ ] Update commit-plan PR list to match Convex-based work (or mark as historical and reference MASTER_PLAN + docs/issues/ for current backlog).

## Acceptance criteria

- A new reader can tell that Convex/BetterAuth is the current stack and where to find the real remaining tasks (MASTER_PLAN + issue files).
