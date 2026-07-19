import { useAuthStore } from "@/features/auth/store";

/** Sentinel used when no school is active, so scoped keys stay well-formed. */
export const NO_SCHOOL_SCOPE = "__no-school__";

/**
 * Reactive read of the active school id. Call inside a query/mutation hook so the
 * component re-renders (and its queryKey changes) the instant the school switches.
 * That is what makes tenant isolation STRUCTURAL: a switch selects a different
 * cache entry, and an in-flight response for the previous school lands under the
 * previous school's (now-unobserved) key, so it can never flash into the new one.
 * The id here mirrors what lib/api-client sends as X-School-Id, so a cache entry
 * is always keyed by the same tenant the request was made for.
 */
export function useSchoolScope(): string {
  return useAuthStore((s) => s.session?.activeSchoolId ?? NO_SCHOOL_SCOPE);
}

/** Imperative read of the active school scope (outside React / in callbacks). */
export function currentSchoolScope(): string {
  return useAuthStore.getState().session?.activeSchoolId ?? NO_SCHOOL_SCOPE;
}
