import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests for OutfAI critical paths.
 * Run with: npm run test:e2e
 * Requires: dev server running (npm run dev) or set baseURL to a deployed preview.
 * Optional: E2E_TEST_EMAIL and E2E_TEST_PASSWORD for authenticated flows.
 * @see docs/archive/issues/29-e2e-tests.md
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
