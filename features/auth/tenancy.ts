import { useAuthStore } from "./store";

/**
 * Mock tenancy helpers. Entity data is scoped to the active school so a freshly-created
 * school starts empty; only the seeded demo schools show sample data.
 */
export const DEMO_SCHOOL_IDS = ["sch_1", "sch_2"];

/**
 * Whether to seed demo data at all. Set `NEXT_PUBLIC_SEED_DEMO=false` to start the WHOLE app
 * empty (no sample schools/students/anything — a "fresh, no-seed" workspace for every account).
 * Default (unset) keeps the demo account (owner@fobs.cm) populated for showcasing.
 */
export const SEED_DEMO = process.env.NEXT_PUBLIC_SEED_DEMO !== "false";

export function activeSchoolId(): string {
  return useAuthStore.getState().session?.activeSchoolId ?? "none";
}

export function isDemoSchool(id: string = activeSchoolId()): boolean {
  return SEED_DEMO && DEMO_SCHOOL_IDS.includes(id);
}

/** localStorage key for an entity list, scoped to the active school. */
export function scopedKey(prefix: string): string {
  return `${prefix}:${activeSchoolId()}`;
}
