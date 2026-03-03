#!/usr/bin/env bash
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  npx convex deploy --cmd 'npm run build'
else
  npx convex deploy --cmd 'npm run build' --preview-name "${VERCEL_GIT_COMMIT_REF:-preview}"
fi
