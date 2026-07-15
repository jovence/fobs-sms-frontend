import { expect, test } from "@playwright/test";
import { Human } from "./human";
import { PERSONAS } from "./personas";

test.describe("Persona · non-technical administrator (owner)", () => {
  test("discovers Students, recovers from an abandoned form, and adds one", async ({ page }) => {
    const human = new Human(page, PERSONAS.administrator);
    await human.arrive();
    await human.signIn();

    await human.think(600);
    await human.measure("open Students from the sidebar", async () => {
      await page.getByRole("link", { name: "Students" }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Students" })).toBeVisible();
    });
    await human.measure("roster loads", async () => {
      await expect(page.getByText(/of 86/)).toBeVisible();
    });

    // A confused user starts a form, changes their mind, and abandons it.
    await page.getByRole("button", { name: "Add student" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Full name").fill("Half Filled");
    await human.think(500);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // Reopening must NOT retain the abandoned value (no confusing stale state).
    await page.getByRole("button", { name: "Add student" }).first().click();
    await expect(dialog.getByLabel("Full name")).toHaveValue("");

    // Now complete the real goal.
    await human.measure("create a student", async () => {
      await dialog.getByLabel("Full name").fill("Grace Ndip");
      await dialog.locator("#gender").click();
      await page.getByRole("option", { name: "Female" }).click();
      await dialog.getByLabel("Date of birth").fill("2011-03-14");
      await dialog.getByLabel("Place of birth").fill("Limbe");
      await dialog.locator("#classId").click();
      await page.getByRole("option", { name: "Form 1", exact: true }).click();
      await dialog.getByRole("button", { name: "Create student" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText(/of 87/)).toBeVisible(); // clear success evidence
    });

    console.log("[administrator] friction:", JSON.stringify(human.summary()));
  });
});
