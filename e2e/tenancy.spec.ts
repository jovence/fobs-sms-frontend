import { expect, test } from "@playwright/test";

/**
 * Regression for the tenancy disconnect: a freshly-registered owner must see the school
 * switcher (not the "Create a school" fallback) and be able to switch — the switcher and the
 * Schools page now read the same source, with the first school auto-selected.
 */
test.describe("Tenancy · school switcher", () => {
  test("a newly-registered owner sees the switcher and can switch schools", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Tenancy Tester");
    await page.getByLabel("Email address").fill(`tenancy_${Date.now()}@fobs.cm`);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // The switcher shows an auto-selected active school — NOT the empty "Create a school" state.
    const switcher = page.getByRole("button", { name: "Switch school" });
    await expect(switcher).toBeVisible();
    await expect(switcher).toContainText("GBHS");

    // Switch to the other school and confirm the active school changes.
    await switcher.click();
    await page.getByRole("menuitem", { name: /Collège Bilingue La Semence/ }).click();
    await expect(switcher).toContainText("CBLS");
  });
});
