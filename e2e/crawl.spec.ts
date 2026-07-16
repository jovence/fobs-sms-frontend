import { expect, test, type Page } from "@playwright/test";
import { signIn } from "./helpers";

const OWNER_ROUTES = [
  "/dashboard",
  "/schools",
  "/students",
  "/teachers",
  "/academics",
  "/attendance",
  "/exams",
  "/reports",
  "/parents",
  "/billing",
  "/referrals",
  "/settings",
];

const ADMIN_ROUTES = [
  "/admin",
  "/admin/schools",
  "/admin/users",
  "/admin/referrals",
  "/admin/app-control",
  "/admin/activity",
];

/** Attach listeners that capture uncaught exceptions (real bugs). */
function captureErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

/** Every screen must: render an <h1>, show no error state, and throw nothing uncaught. */
async function assertHealthy(page: Page, path: string, errors: string[]) {
  await page.goto(path);
  await expect(
    page.getByRole("heading", { level: 1 }).first(),
    `${path}: no <h1> rendered`,
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByText(/something went wrong|couldn.t load|access restricted/i),
    `${path}: shows an error state`,
  ).toHaveCount(0);
  expect(errors, `${path}: uncaught errors:\n${errors.join("\n")}`).toHaveLength(0);
}

test.describe("Crawl · owner surfaces render cleanly", () => {
  for (const path of OWNER_ROUTES) {
    test(`owner ${path}`, async ({ page }) => {
      const errors = captureErrors(page);
      await signIn(page, "owner");
      await assertHealthy(page, path, errors);
    });
  }
});

test.describe("Crawl · admin surfaces render cleanly", () => {
  for (const path of ADMIN_ROUTES) {
    test(`admin ${path}`, async ({ page }) => {
      const errors = captureErrors(page);
      await signIn(page, "admin");
      await assertHealthy(page, path, errors);
    });
  }
});
