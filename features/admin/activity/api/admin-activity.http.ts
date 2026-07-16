import { api } from "@/lib/api-client";
import type { Paginated } from "@/types";
import type { ActivityEntry, ActivityType } from "../types";
import type { AdminActivityService } from "./admin-activity.service";

/**
 * Live implementation of {@link AdminActivityService} against the Laravel backend
 * (`GET /api/dashboard/admin/activities`, SuperAdmin audit log). Maps the snake_case
 * `ActivityResource` payload onto the UI's camelCase {@link ActivityEntry} type.
 *
 * NOTE: the backend index only supports `page`, `per_page` and `school_id`. The UI's
 * `search`, `type`, `sortBy` and `sortDir` query fields have no server-side counterpart,
 * so they are ignored here (the feed is always newest-first, server-paginated).
 */

/** Shape of the backend `ActivityResource` (snake_case, ids numeric). */
interface ActivityPayload {
  id: number | string;
  type: string;
  description: string | null;
  related_id: number | string | null;
  related_type: string | null;
  school_id: number | string | null;
  user_id: number | string | null;
  created_at: string | null;
  user?: { id: number | string; name: string; role: string } | null;
  school?: { id: number | string; name: string } | null;
}

const KNOWN_TYPES: readonly ActivityType[] = [
  "enrollment",
  "marks",
  "attendance",
  "payment",
  "teacher",
  "school",
];

/**
 * Normalise the backend `type` string onto the UI's fixed {@link ActivityType} union.
 * Backend records values like `teacher_assignment`; anything unrecognised falls back to
 * `school` (a sensible catch-all for admin/system events). NOTE: this is a lossy narrowing.
 */
function toActivityType(value: string): ActivityType {
  if ((KNOWN_TYPES as readonly string[]).includes(value)) {
    return value as ActivityType;
  }
  if (value === "teacher_assignment") return "teacher";
  return "school";
}

function mapActivity(p: ActivityPayload): ActivityEntry {
  return {
    id: String(p.id),
    type: toActivityType(p.type),
    description: p.description ?? "",
    // Resource nests the related user/school; fall back to empty when not loaded.
    actor: p.user?.name ?? "",
    school: p.school?.name ?? "",
    at: p.created_at ?? "",
  };
}

export const httpAdminActivityService: AdminActivityService = {
  async list(query): Promise<Paginated<ActivityEntry>> {
    const params = new URLSearchParams({
      page: String(query.page),
      per_page: String(query.perPage),
    });
    const { data, meta } = await api.list<ActivityPayload>(
      `/dashboard/admin/activities?${params.toString()}`,
    );
    const items = data.map(mapActivity);
    return {
      items,
      page: meta?.current_page ?? query.page,
      perPage: meta?.per_page ?? query.perPage,
      total: meta?.total ?? items.length,
      totalPages: meta?.last_page ?? 1,
    };
  },
};
