# Update implementation-plan and commit-plan for Convex

**Labels:** `documentation`, `chore`

## Description

[implementation-plan.md](../implementation-plan.md) and [commit-plan.md](../commit-plan.md) describe Supabase, Prisma, and tRPC. The project uses **Convex** and **BetterAuth**. Update both docs so they reflect the current stack and remaining work, or archive them and point to [MASTER_PLAN.md](../MASTER_PLAN.md).

## Tasks

- [ ] Either: Rewrite implementation-plan phases to Convex/BetterAuth (Phase 0 = Convex schema + auth already done; list remaining phases).
- [ ] Or: Add a prominent "Superseded" notice at the top of both docs with a link to MASTER_PLAN.md and profile-and-account-settings-issues.md for remaining work.
- [ ] Update commit-plan PR list to match Convex-based work (or mark as historical and reference MASTER_PLAN + docs/issues/ for current backlog).

## Acceptance criteria

- A new reader can tell that Convex/BetterAuth is the current stack and where to find the real remaining tasks (MASTER_PLAN + issue files).
