import { describe, expect, it } from "vitest";
import { can, canAny } from "./rbac";

describe("rbac", () => {
  it("grants owners school management", () => {
    expect(can("owner", "school.manage")).toBe(true);
  });

  it("denies owners the admin panel", () => {
    expect(can("owner", "admin.access")).toBe(false);
  });

  it("gives admins everything", () => {
    expect(can("admin", "admin.access")).toBe(true);
    expect(can("admin", "billing.manage")).toBe(true);
  });

  it("limits teachers to their scope", () => {
    expect(can("teacher", "attendance.manage")).toBe(true);
    expect(can("teacher", "student.manage")).toBe(false);
  });

  it("returns false for no role", () => {
    expect(can(null, "student.view")).toBe(false);
    expect(canAny(undefined, ["student.view", "report.view"])).toBe(false);
  });
});
