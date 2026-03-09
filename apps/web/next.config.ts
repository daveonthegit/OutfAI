import type { NextConfig } from "next";
import path from "path";
import { readFileSync } from "fs";

// Load .env.local from monorepo root so Convex (and other) vars are available.
// Next.js only reads .env* from the app dir (apps/web); root .env.local is used by Convex CLI.
function loadRootEnvLocal(): Record<string, string> {
  const rootEnvPath = path.resolve(process.cwd(), "..", ".env.local");
  try {
    const content = readFileSync(rootEnvPath, "utf-8");
    const env: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

const rootEnv = loadRootEnvLocal();

const nextConfig: NextConfig = {
  env: {
    ...rootEnv,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
