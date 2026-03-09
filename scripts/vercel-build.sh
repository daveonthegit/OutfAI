#!/usr/bin/env bash
set -euo pipefail

# Production: set CONVEX_DEPLOY_KEY (Production deploy key) in Vercel → Production only.
# Preview: set CONVEX_DEPLOY_KEY (Preview deploy key from Convex Dashboard) in Vercel → Preview only.
# See https://docs.convex.dev/production/hosting/vercel#preview-deployments
if [ "${VERCEL_ENV:-}" = "production" ]; then
  npx convex deploy --cmd 'npm run build'
else
  npx convex deploy --cmd 'npm run build' --preview-create "${VERCEL_GIT_COMMIT_REF:-preview}"
fi
