# ============================================================
# OutfAI — Production Dockerfile (multi-stage)
# ============================================================
# Build:  docker build -t outfai .
# Run:    docker run -p 3000:3000 --env-file .env.local outfai
# ============================================================

# ---- Base image shared across stages ----
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


# ---- Stage 1: Install all dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --frozen-lockfile


# ---- Stage 2: Build the Next.js app ----
FROM base AS builder
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
# Copy source (respects .dockerignore — no node_modules, .next, etc.)
COPY . .

RUN npm run build


# ---- Stage 3: Lean production runner ----
FROM base AS runner
ENV NODE_ENV=production

# Unprivileged user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Runtime dependencies only
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules  ./node_modules

# Built app and all source dirs referenced by `next start`
COPY --from=builder --chown=nextjs:nodejs /app/apps    ./apps
COPY --from=builder --chown=nextjs:nodejs /app/server  ./server
COPY --from=builder --chown=nextjs:nodejs /app/shared  ./shared
COPY --from=builder --chown=nextjs:nodejs /app/package*.json  ./
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json  ./

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# `npm run start` executes: cd apps/web && next start
CMD ["npm", "run", "start"]
