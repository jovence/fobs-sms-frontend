import { api } from "@/lib/api-client";
import { ApiError } from "@/types";
import type { Paginated } from "@/types";
import type { Parent, ParentQuery } from "../types";
import type { ParentsService } from "./parents.service";

/**
 * Live implementation of {@link ParentsService} against the Laravel backend.
 * The frontend "parents" feature maps to backend "tutors"
 * (`/api/dashboard/tutors`, active-school-scoped via the `X-School-Id` header).
 *
 * The backend `TutorResource` payload is snake_case with a numeric id; this file
 * maps it onto the UI's camelCase {@link Parent} type. Note: the tutors index does
 * NOT return an array in `data` — it nests `data.tutors` (plus classes/school/totals),
 * with pagination in the envelope `meta`. So we read both via `api.list` and cast
 * `data` onto the real index payload shape (see {@link list}).
 */

/** A user relation on the tutor (whenLoaded — the index eager-loads it). */
interface TutorUserPayload {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  created_at: string | null;
}

/** Shape of the backend `TutorResource` (snake_case, `id` numeric). */
interface TutorPayload {
  id: number | string;
  name: string | null;
  contact: string | null;
  phone: string | null;
  occupation: string | null;
  address: string | null;
  is_approved: boolean;
  user?: TutorUserPayload | null;
  // `students` is whenLoaded; the index loads it — we only need its count here.
  students?: unknown[] | null;
  created_at: string | null;
}

/** The tutors index nests the paginated rows under `data.tutors` (not a bare array). */
interface TutorIndexPayload {
  tutors: TutorPayload[];
  totalParents?: number;
  totalStudentsWithParent?: number;
  totalStudentsWithoutParent?: number;
}

function mapTutor(p: TutorPayload): Parent {
  return {
    id: String(p.id),
    // `name` comes off the tutor; fall back to the linked user's name.
    name: p.name ?? p.user?.name ?? "",
    // Backend has no dedicated `email`; `contact` holds it, with the user as fallback.
    email: p.contact ?? p.user?.email ?? "",
    phone: p.phone ?? p.user?.phone ?? "",
    occupation: p.occupation ?? "",
    address: p.address ?? "",
    // Derived from the eager-loaded, school-scoped students relation (default 0).
    childrenCount: Array.isArray(p.students) ? p.students.length : 0,
    // Backend exposes no avatar for tutors.
    avatarUrl: null,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

export const httpParentsService: ParentsService = {
  async list(query: ParentQuery): Promise<Paginated<Parent>> {
    // Backend supports `page` + `search` (+ `class_id`); page size is fixed at 15
    // server-side and there is no sort param — so `perPage`/`sortBy`/`sortDir` are ignored.
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    if (query.search) params.set("search", query.search);

    // `data` is the index object `{ tutors, ... }`; `meta` carries the real pagination.
    const res = await api.list<TutorPayload>(`/dashboard/tutors?${params.toString()}`);
    const payload = res.data as unknown as TutorIndexPayload;
    const meta = res.meta;
    const items = (payload?.tutors ?? []).map(mapTutor);

    return {
      items,
      page: meta?.current_page ?? query.page,
      perPage: meta?.per_page ?? query.perPage,
      total: meta?.total ?? items.length,
      totalPages: meta?.last_page ?? 1,
    };
  },

  async create(): Promise<Parent> {
    // No create endpoint exists for tutors (parents self-register on the mobile app).
    throw new ApiError("Not available yet.", "unknown", 501);
  },

  async update(): Promise<Parent> {
    // No update endpoint exists for tutors.
    throw new ApiError("Not available yet.", "unknown", 501);
  },

  async remove(id: string): Promise<void> {
    // DELETE unlinks the tutor from all students in the active school.
    await api.delete<null>(`/dashboard/tutors/${id}`);
  },

  async bulkRemove(ids: string[]): Promise<void> {
    // No bulk endpoint — fan out to the single-delete endpoint per id.
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/tutors/${id}`)));
  },
};
