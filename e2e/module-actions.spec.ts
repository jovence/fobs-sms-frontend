import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test.describe("Module actions · core flows", () => {
  test("Teachers: approve a pending join request", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/teachers");
    // Filter to pending requests (status Select is the first combobox in the toolbar).
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Pending request" }).click();
    const approve = page.getByRole("button", { name: "Approve" }).first();
    await expect(approve).toBeVisible();
    await approve.click();
    await expect(page.getByText("Teacher approved.")).toBeVisible();
  });

  test("Academics: create a class", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/academics");
    await page.getByRole("button", { name: "Add class" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Class name").fill("Zeta Test Class");
    await dialog.getByRole("button", { name: "Create class" }).click();
    await expect(dialog).toBeHidden();
  });

  test("Parents: create a parent", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/parents");
    await page.getByRole("button", { name: "Add parent" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Full name").fill("Test Parent");
    await dialog.getByLabel("Email").fill("testparent@fobs.cm");
    await dialog.getByLabel("Phone").fill("+237690000000");
    await dialog.getByLabel("Occupation").fill("Trader");
    await dialog.getByLabel("Address").fill("Buea Town, South-West");
    await dialog.getByRole("button", { name: "Add parent" }).click();
    await expect(dialog).toBeHidden();
  });

  test("Settings: switch between all tabs", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/settings");
    for (const tab of ["Profile", "Security", "Preferences", "Notifications"]) {
      const t = page.getByRole("tab", { name: tab });
      await t.click();
      await expect(t).toHaveAttribute("data-state", "active");
    }
  });

  test("Attendance: record a session for a class", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/attendance");
    await page.getByRole("tab", { name: "Record" }).click();
    // Pick a class then a subject → the roster loads.
    const combos = page.getByRole("combobox");
    await combos.nth(0).click();
    await page.getByRole("option").first().click();
    await combos.nth(1).click();
    await page.getByRole("option").first().click();
    // Save the session.
    const save = page.getByRole("button", { name: "Save attendance" });
    await expect(save).toBeVisible({ timeout: 15_000 });
    await save.click();
    await expect(page.getByText("Attendance saved")).toBeVisible();
  });

  test("Exams: create an exam sequence", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/exams");
    await page.getByRole("button", { name: "Add exam" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Exam name").fill("Third Sequence Test");
    await dialog.getByRole("button", { name: "Create exam" }).click();
    await expect(dialog).toBeHidden();
  });

  test("Marks: selecting class/subject/exam loads the entry roster", async ({ page }) => {
    await signIn(page, "owner");
    await page.goto("/reports");
    await page.getByRole("tab", { name: "Mark entry" }).click();
    const combos = page.getByRole("combobox");
    for (let i = 0; i < 3; i++) {
      await combos.nth(i).click();
      await page.getByRole("option").first().click();
    }
    await expect(page.getByRole("button", { name: "Save marks" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("Admin: toggle a school's demo flag", async ({ page }) => {
    await signIn(page, "admin");
    await page.goto("/admin/schools");
    await page.getByRole("button", { name: "Actions" }).first().click();
    await page.getByRole("menuitem", { name: "Toggle demo" }).click();
    await expect(page.getByText("Demo flag updated.")).toBeVisible();
  });

  test("Admin: delete a (non-admin) user", async ({ page }) => {
    await signIn(page, "admin");
    await page.goto("/admin/users");
    await page.getByRole("button", { name: "Actions" }).first().click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("User deleted.")).toBeVisible();
  });
});
