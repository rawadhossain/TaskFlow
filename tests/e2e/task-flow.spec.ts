import { expect, test } from "@playwright/test";

test.describe("shell", () => {
  test("/tasks redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login/i);
    await expect(page.getByRole("button", { name: /Continue with google/i })).toBeVisible();
  });

  test("/ shows marketing shell with sign-in CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: /main navigation/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /do the work/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^get started$/i }).first()).toBeVisible();
  });
});
