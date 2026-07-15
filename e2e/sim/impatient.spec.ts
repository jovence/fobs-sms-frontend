import { expect, test } from "@playwright/test";
import { Human } from "./human";
import { PERSONAS } from "./personas";

test.describe("Persona · impatient user", () => {
  test("mashing Create does not create duplicate students", async ({ page }) => {
    const human = new Human(page, PERSONAS.impatient);
    await human.arrive();
    await human.signIn();
    await page.goto("/students");
    await expect(page.getByText(/of 86/)).toBeVisible();

    await page.getByRole("button", { name: "Add student" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Full name").fill("Rapid Clicker");
    await dialog.locator("#gender").click();
    await page.getByRole("option", { name: "Male", exact: true }).click();
    await dialog.getByLabel("Date of birth").fill("2010-01-01");
    await dialog.getByLabel("Place of birth").fill("Douala");
    await dialog.locator("#classId").click();
    await page.getByRole("option", { name: "Form 1", exact: true }).click();

    // Impatiently mash submit several times.
    const submit = dialog.getByRole("button", { name: "Create student" });
    await submit.click();
    await submit.click({ force: true }).catch(() => {});
    await submit.click({ force: true }).catch(() => {});

    await expect(dialog).toBeHidden();
    // Exactly ONE student added — the busy-disabled button must prevent duplicates.
    await expect(page.getByText(/of 87/)).toBeVisible();
    await expect(page.getByText(/of 8[89]/)).toBeHidden();
  });

  test("rapid filter switching keeps the table consistent", async ({ page }) => {
    const human = new Human(page, PERSONAS.impatient);
    await human.arrive();
    await human.signIn();
    await page.goto("/students");
    await expect(page.getByText(/of 86/)).toBeVisible();

    // The status filter is the 2nd combobox (after the class filter).
    const status = page.getByRole("combobox").nth(1);
    for (const name of ["Approved", "Pending", "Rejected", "Approved"]) {
      await status.click();
      await page.getByRole("option", { name, exact: true }).click();
    }
    await expect(page.getByRole("table")).toBeVisible();
    await expect(
      page.getByText(/\d+–\d+ of \d+|No matching students/),
    ).toBeVisible();
  });
});
