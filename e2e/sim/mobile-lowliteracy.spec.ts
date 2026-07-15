import { devices, expect, test } from "@playwright/test";
import { Human } from "./human";
import { PERSONAS } from "./personas";

test.use({ ...devices["Pixel 5"] });

test.describe("Persona · low-literacy user, cheap Android, slow 3G", () => {
  test("signs in with visible loading feedback and no horizontal scroll", async ({ page }) => {
    const human = new Human(page, PERSONAS.mobileLowLiteracy);
    await human.arrive(); // slow-3g throttle

    await page.goto("/login");
    await page.getByLabel("Email address").fill("owner@fobs.cm");
    await page.getByLabel("Password", { exact: true }).fill("password");
    const signIn = page.locator('form button[type="submit"]');
    await signIn.click();
    // Perceived-latency: the control must show it is working (disabled + "Signing in…").
    await expect(signIn).toBeDisabled();
    await expect(signIn).toContainText(/Signing in/i);
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 25_000 });

    await human.expectNoHorizontalScroll();

    // Navigate via the mobile menu (icon-only hamburger must be labelled).
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("link", { name: "Students" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Students" })).toBeVisible({
      timeout: 25_000,
    });
    await human.expectNoHorizontalScroll();

    // Under slow 3G the roster must still resolve to real data (skeleton → data).
    await human.measure("students roster under slow-3g", async () => {
      await expect(page.getByText(/of 86/)).toBeVisible({ timeout: 25_000 });
    });

    console.log("[mobile-lowliteracy] metrics:", JSON.stringify(human.summary()));
  });
});
