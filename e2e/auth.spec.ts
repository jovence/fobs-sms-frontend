import { expect, test } from "@playwright/test";
import { DEMO, signIn } from "./helpers";

test.describe("Authentication", () => {
  test("unauthenticated dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("sign in with valid credentials lands on the dashboard", async ({ page }) => {
    await signIn(page, "owner");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Amina");
  });

  test("sign in with a wrong password shows an inline error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(DEMO.owner.email);
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("admin can reach the SuperAdmin panel; owner cannot", async ({ page }) => {
    await signIn(page, "admin");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("owner is redirected away from the admin panel", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
