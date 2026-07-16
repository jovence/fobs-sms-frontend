import { api } from "@/lib/api-client";
import { ApiError } from "@/types";
import type { Paginated } from "@/types";
import type { AdminSchool, SubscriptionTier } from "../types";
import type { AdminSchoolsService } from "./admin-schools.service";

/**
 * Live implementation of {@link AdminSchoolsService} against the Laravel SuperAdmin API
 * (`/api/dashboard/admin/schools`). Maps the backend's snake_case `SchoolResource` payload
 * onto the UI's camelCase {@link AdminSchool} type.
 */

/**
 * Shape of the backend `SchoolResource` (snake_case, `id` numeric). The `show` endpoint also
 * merges `student_count` / `teacher_count` / `class_count`; the index endpoint omits them.
 */
interface AdminSchoolPayload {
  id: number | string;
  name: string;
  acronym: string;
  code: string;
  subscription: string | null;
  is_demo: boolean;
  created_at: string | null;
  student_count?: number | null;
  teacher_count?: number | null;
}

/** The `{ type, message }` result the tier upgrade/downgrade endpoints return. */
interface TierChangeResult {
  type: string;
  message: string;
}

function toSubscription(value: string | null): SubscriptionTier {
  return value === "basic" || value === "pro" ? value : "free";
}

function mapAdminSchool(p: AdminSchoolPayload): AdminSchool {
  return {
    id: String(p.id),
    name: p.name,
    acronym: p.acronym,
    code: p.code,
    // NOTE: these admin endpoints do not expose the owner; the UI's ownerName has no source.
    ownerName: "",
    subscription: toSubscription(p.subscription),
    isDemo: p.is_demo,
    // NOTE: the index payload omits counts (only `show` provides them) → default 0.
    studentCount: p.student_count ?? 0,
    teacherCount: p.teacher_count ?? 0,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/** Re-fetch a single school via the `show` endpoint so counts + latest subscription are accurate. */
async function fetchAdminSchool(id: string): Promise<AdminSchool> {
  const school = await api.get<AdminSchoolPayload>(`/dashboard/admin/schools/${id}`);
  return mapAdminSchool(school);
}

/** POST a tier change; the endpoint wraps success:true even for domain rejections, so branch on `type`. */
async function postTierChange(path: string): Promise<void> {
  const result = await api.post<TierChangeResult>(path);
  if (result?.type === "error") {
    throw new ApiError(result.message ?? "Tier change was rejected.", "validation", 422);
  }
}

export const httpAdminSchoolsService: AdminSchoolsService = {
  async list(query): Promise<Paginated<AdminSchool>> {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    params.set("per_page", String(query.perPage));
    if (query.search) params.set("search", query.search);
    // NOTE: the backend index only supports `search` + pagination; `subscription`, `sortBy`,
    // and `sortDir` are unsupported server-side and are not sent.

    const { data, meta } = await api.list<AdminSchoolPayload>(
      `/dashboard/admin/schools?${params.toString()}`,
    );
    const items = data.map(mapAdminSchool);
    return {
      items,
      page: meta?.current_page ?? query.page,
      perPage: meta?.per_page ?? query.perPage,
      total: meta?.total ?? items.length,
      totalPages: meta?.last_page ?? 1,
    };
  },

  async setTier(id, tier): Promise<AdminSchool> {
    if (tier === "basic") {
      await postTierChange(`/dashboard/admin/schools/${id}/upgrade-to-basic`);
    } else if (tier === "free") {
      await postTierChange(`/dashboard/admin/schools/${id}/downgrade-to-free`);
    } else {
      // NOTE: no backend endpoint promotes a school to the "pro" tier.
      throw new ApiError("Upgrading to the Pro plan is not available yet.", "unknown", 501);
    }
    return fetchAdminSchool(id);
  },

  async toggleDemo(id): Promise<AdminSchool> {
    await api.post<AdminSchoolPayload>(`/dashboard/admin/schools/${id}/toggle-demo`);
    // Re-fetch via `show` so the returned row carries accurate counts (toggle omits them).
    return fetchAdminSchool(id);
  },
};
