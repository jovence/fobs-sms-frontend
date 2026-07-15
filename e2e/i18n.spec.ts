import { expect, test } from "@playwright/test";

test.describe("Bilingual (EN/FR)", () => {
  test("English landing renders", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Run your school with clarity/i }),
    ).toBeVisible();
  });

  test("French landing renders localized copy", async ({ page }) => {
    await page.goto("/fr");
    await expect(
      page.getByRole("heading", { level: 1, name: /Gérez votre établissement/i }),
    ).toBeVisible();
  });

  test("French login page is localized", async ({ page }) => {
    await page.goto("/fr/login");
    await expect(page.getByRole("heading", { name: /Bon retour/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });
});
