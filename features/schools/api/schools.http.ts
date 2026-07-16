import { api } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";
import type { School, SubscriptionTier } from "@/types";
import type { SchoolInput } from "../types";
import type { SchoolsService } from "./schools.service";

/**
 * Live implementation of {@link SchoolsService} against the Laravel backend
 * (`/api/dashboard/schools`, owner-scoped). Reference for every other `.http` service:
 * call through `lib/api-client` (envelope-unwrapped), then map the backend's snake_case
 * `SchoolResource` payload onto the UI's camelCase {@link School} type.
 */

/** Shape of the backend `SchoolResource` (snake_case, `id` numeric). */
interface SchoolPayload {
  id: number | string;
  name: string;
  acronym: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  academic_year: string | null;
  subscription: string | null;
  is_demo: boolean;
  logo_url: string | null;
  website?: string | null;
  description?: string | null;
  created_at: string | null;
}

function toSubscription(value: string | null): SubscriptionTier {
  return value === "basic" || value === "pro" ? value : "free";
}

function mapSchool(p: SchoolPayload): School {
  return {
    id: String(p.id),
    name: p.name,
    acronym: p.acronym,
    code: p.code,
    // The resource omits owner_id (owner-scoped endpoint); the owner is the signed-in user.
    ownerId: useAuthStore.getState().session?.user?.id ?? "",
    email: p.email,
    phone: p.phone,
    address: p.address,
    academicYear: p.academic_year ?? "",
    logoUrl: p.logo_url,
    subscription: toSubscription(p.subscription),
    isDemo: p.is_demo,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/** Owner API validates name/acronym/address/email/phone as required — send the trimmed set. */
function toPayload(input: SchoolInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    acronym: input.acronym.trim(),
    email: input.email?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    address: input.address?.trim() ?? "",
  };
}

export const httpSchoolsService: SchoolsService = {
  async list() {
    // Index is paginated; owners have few schools, so pull a generous page and map.
    const { data } = await api.list<SchoolPayload>("/dashboard/schools?per_page=200");
    return data.map(mapSchool);
  },
  async create(input) {
    const school = await api.post<SchoolPayload>("/dashboard/schools", toPayload(input));
    return mapSchool(school);
  },
  async update(id, input) {
    const school = await api.put<SchoolPayload>(`/dashboard/schools/${id}`, toPayload(input));
    return mapSchool(school);
  },
  async remove(id) {
    await api.delete<null>(`/dashboard/schools/${id}`);
  },
};
