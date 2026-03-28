import type { NextConfig } from "next";

/**
 * Next.js loads `.env*` from `apps/web` only. Keep server secrets out of this file.
 * Convex CLI may use a repo-root `.env.local`; do not inject that wholesale into `env`
 * (it can leak server-only keys into client bundles via `nextConfig.env`).
 */
const nextConfig: NextConfig = {
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
