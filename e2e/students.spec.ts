import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test.describe("Students module", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto("/students");
    await expect(page.getByRole("heading", { level: 1, name: "Students" })).toBeVisible();
  });

  test("loads the seeded roster with pagination", async ({ page }) => {
    await expect(page.getByText(/of 86/)).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("search narrows to the empty state for no matches", async ({ page }) => {
    await page.getByPlaceholder(/Search by name or matricule/).fill("zzzzzzzzzz");
    await expect(page.getByText("No matching students")).toBeVisible();
  });

  test("filtering by status returns matching rows (not empty)", async ({ page }) => {
    await page.getByRole("combobox").filter({ hasText: "All statuses" }).click();
    await page.getByRole("option", { name: "Approved" }).click();
    await expect(page.getByRole("table")).toBeVisible();
    // Most seeded students are Approved, so this filter must NOT be empty.
    await expect(page.getByText("No matching students")).toBeHidden();
    await expect(page.getByText(/\d+–\d+ of \d+/)).toBeVisible();
  });

  test("creating a student adds them to the roster", async ({ page }) => {
    await page.getByRole("button", { name: "Add student" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Full name").fill("Test E2E Student");
    await dialog.locator("#gender").click();
    await page.getByRole("option", { name: "Female" }).click();
    await dialog.getByLabel("Date of birth").fill("2010-05-05");
    await dialog.getByLabel("Place of birth").fill("Buea");
    await dialog.locator("#classId").click();
    await page.getByRole("option", { name: "Form 1", exact: true }).click();

    await dialog.getByRole("button", { name: "Create student" }).click();

    // Sheet closes and the roster now holds one more student.
    await expect(dialog).toBeHidden();
    await expect(page.getByText(/of 87/)).toBeVisible();
  });
});
