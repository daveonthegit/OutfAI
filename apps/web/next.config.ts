import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Next.js loads `.env*` from `apps/web` only. Keep server secrets out of this file.
 * Convex CLI may use a repo-root `.env.local`; do not inject that wholesale into `env`
 * (it can leak server-only keys into client bundles via `nextConfig.env`).
 */
const nextConfig: NextConfig = {
  eslint: {
    // Repo-level `npm run lint` is the CI gate; avoid duplicate Next build linting
    // because the root flat config already owns framework rules.
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: repoRoot,
  serverExternalPackages: ["@google-cloud/vision"],
  async redirects() {
    return [
      { source: "/calendar", destination: "/plan/calendar", permanent: true },
      { source: "/packing", destination: "/plan/packing", permanent: true },
      {
        source: "/packing/:id",
        destination: "/plan/packing/:id",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/api/storage/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
