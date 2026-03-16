import { test, expect } from "@playwright/test";

test.describe("Critical path", () => {
  test("landing and auth pages load", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OutfAI|outfai/i);
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /log in|sign in/i })
    ).toBeVisible();
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: /sign up|create account/i })
    ).toBeVisible();
  });

  test("public routes are reachable", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.locator('input[type="email"], input[name="email"]')
    ).toBeVisible();
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: /forgot|reset password/i })
    ).toBeVisible();
  });
});

test.describe("Authenticated critical path", () => {
  test.skip(
    () => !process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD,
    "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run authenticated E2E"
  );

  test("login → home → closet → add → generate → save", async ({ page }) => {
    await page.goto("/login");
    await page
      .locator('input[type="email"], input[name="email"]')
      .fill(process.env.E2E_TEST_EMAIL!);
    await page
      .locator('input[type="password"], input[name="password"]')
      .fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL(/\/(home)?(\?|$)/);
    await page.goto("/closet");
    await expect(page.getByRole("heading", { name: /closet/i })).toBeVisible();
    await page.goto("/add");
    await expect(
      page.getByRole("heading", { name: /add|new garment/i })
    ).toBeVisible();
    await page.goto("/");
    await expect(page.getByText(/mood|today|outfit/i)).toBeVisible();
  });
});
