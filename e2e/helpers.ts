import { expect, type Page } from "@playwright/test";

export const DEMO = {
  owner: { email: "owner@fobs.cm", password: "password" },
  admin: { email: "admin@fobs.cm", password: "password" },
};

/** Sign in through the real login form and wait for the dashboard. */
export async function signIn(
  page: Page,
  who: keyof typeof DEMO = "owner",
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(DEMO[who].email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO[who].password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
