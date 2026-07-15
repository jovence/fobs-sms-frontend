import { expect, test } from "@playwright/test";
import { signIn } from "../helpers";

/**
 * Client-side authorization enforcement. (Backend/API-layer authorization is verified
 * separately once the live API exists — hiding a control is never sufficient security.)
 */
test.describe("Authorization · client-side enforcement", () => {
  test("logged-out user hitting an app URL is redirected to login", async ({ page }) => {
    await page.goto("/students");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("owner is blocked from the admin panel via direct URLs", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("admin can reach the admin panel and its pages", async ({ page }) => {
    await signIn(page, "admin");
    await page.goto("/admin/schools");
    await expect(page).toHaveURL(/\/admin\/schools$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
