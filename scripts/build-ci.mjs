import { spawnSync } from "node:child_process";

process.env.NEXT_PUBLIC_CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";
process.env.NEXT_PUBLIC_CONVEX_SITE_URL =
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "https://placeholder.convex.site";
process.env.CONVEX_SITE_URL =
  process.env.CONVEX_SITE_URL ?? "https://placeholder.convex.site";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["run", "build"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
