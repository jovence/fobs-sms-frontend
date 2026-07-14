import type { Role } from "@/types";

/**
 * Permission catalogue. Feature UIs gate on these strings via `can()` rather than
 * checking roles directly, so access rules live in one auditable place.
 */
export type Permission =
  | "school.view"
  | "school.manage"
  | "student.view"
  | "student.manage"
  | "teacher.view"
  | "teacher.manage"
  | "academics.view"
  | "academics.manage"
  | "attendance.view"
  | "attendance.manage"
  | "exam.view"
  | "exam.manage"
  | "report.view"
  | "report.generate"
  | "parent.view"
  | "billing.view"
  | "billing.manage"
  | "referral.manage"
  | "admin.access";

const ALL: Permission[] = [
  "school.view",
  "school.manage",
  "student.view",
  "student.manage",
  "teacher.view",
  "teacher.manage",
  "academics.view",
  "academics.manage",
  "attendance.view",
  "attendance.manage",
  "exam.view",
  "exam.manage",
  "report.view",
  "report.generate",
  "parent.view",
  "billing.view",
  "billing.manage",
  "referral.manage",
  "admin.access",
];

const OWNER: Permission[] = ALL.filter((p) => p !== "admin.access");

export const rolePermissions: Record<Role, Permission[]> = {
  admin: ALL,
  owner: OWNER,
  teacher: [
    "school.view",
    "student.view",
    "academics.view",
    "attendance.view",
    "attendance.manage",
    "exam.view",
    "report.view",
  ],
  parent: ["student.view", "report.view"],
};
