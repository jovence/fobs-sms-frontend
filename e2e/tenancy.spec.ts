import { expect, test } from "@playwright/test";

/**
 * A freshly-registered account must start EMPTY — no schools it never created, and an empty
 * dashboard. Creating a school makes it the active school, and the dashboard then shows the
 * honest "no data yet" state (real zeros) rather than demo analytics.
 */
test.describe("Tenancy · a new account starts empty", () => {
  test("register → empty dashboard → create a school → it becomes active", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Fresh Owner");
    await page.getByLabel("Email address").fill(`fresh_${Date.now()}@fobs.cm`);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // No schools yet → the dashboard shows the first-run "create your first school" prompt,
    // NOT demo schools or fake KPIs.
    await expect(page.getByText("Create your first school")).toBeVisible();

    // Create a school.
    await page.goto("/schools");
    await page.getByRole("button", { name: "Add school" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("School name").fill("My New Academy");
    await dialog.getByLabel("Acronym").fill("MNA");
    await dialog.getByRole("button", { name: "Create school" }).click();
    await expect(dialog).toBeHidden();

    // The switcher now shows the created school as active.
    const switcher = page.getByRole("button", { name: "Switch school" });
    await expect(switcher).toBeVisible();
    await expect(switcher).toContainText("MNA");

    // The dashboard reflects a real, empty school (no fake analytics).
    await page.goto("/dashboard");
    await expect(page.getByText("Your dashboard is ready")).toBeVisible();
  });
});
