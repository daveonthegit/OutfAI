# OutfAI — System Architecture

## Architecture Overview

OutfAI uses a web-first, API-driven architecture with a single TypeScript codebase.

```text
Client (Next.js / React)
        ↓
tRPC API Layer
        ↓
Service Layer (Business Logic)
        ↓
PostgreSQL (Prisma ORM)
        ↓
External APIs (Weather, Images, Storefronts)
```

---

## Key Architectural Decisions

### Monorepo

- Single repository for frontend and backend
- Shared types and utilities
- Faster development and fewer integration issues

### tRPC API Layer

- End-to-end type safety
- No REST boilerplate
- Ideal for small teams and capstones

### Service-Oriented Backend

- Routers handle I/O only
- Services handle business logic
- Easy to test and refactor

### Image Storage

- Object storage (Cloudflare R2 or S3)
- Signed uploads
- CDN delivery
- URLs stored in database

### Recommendation Engine

- Rule-based for MVP
- Explainable outputs
- Data logged for future ML improvements

---

## Non-Goals

- No microservices
- No message queues
- No custom auth system
- No heavy ML pipelines in MVP

This architecture prioritizes simplicity, clarity, and extensibility.
