import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

/** Fail only on serious/critical WCAG violations (the QE a11y gate). */
async function scan(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
}

test.describe("Accessibility (WCAG 2.1 AA)", () => {
  test("marketing landing has no serious/critical violations", async ({ page }) => {
    await page.goto("/");
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations.map((v) => v.id))).toEqual([]);
  });

  test("login page has no serious/critical violations", async ({ page }) => {
    await page.goto("/login");
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations.map((v) => v.id))).toEqual([]);
  });

  test("dashboard has no serious/critical violations", async ({ page }) => {
    await signIn(page);
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations.map((v) => v.id))).toEqual([]);
  });
});
