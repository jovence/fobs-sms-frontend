import { rolePermissions, type Permission } from "@/config/roles";
import type { Role } from "@/types";

/** Central authorization check. UIs call `can(role, "student.manage")`. */
export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canAny(role: Role | undefined | null, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}
