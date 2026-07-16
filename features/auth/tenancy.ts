import { useAuthStore } from "./store";

/**
 * Mock tenancy helpers. Entity data is scoped to the active school so a freshly-created
 * school starts empty; only the seeded demo schools show sample data.
 */
export const DEMO_SCHOOL_IDS = ["sch_1", "sch_2"];

export function activeSchoolId(): string {
  return useAuthStore.getState().session?.activeSchoolId ?? "none";
}

export function isDemoSchool(id: string = activeSchoolId()): boolean {
  return DEMO_SCHOOL_IDS.includes(id);
}

/** localStorage key for an entity list, scoped to the active school. */
export function scopedKey(prefix: string): string {
  return `${prefix}:${activeSchoolId()}`;
}
