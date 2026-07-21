import { api, downloadFile } from "@/lib/api-client";
import { ApiError } from "@/types";
import type { Paginated } from "@/types";
import type {
  ConnectedStudent,
  Parent,
  ParentDetail,
  ParentQuery,
  ParentStats,
} from "../types";
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

/** Class relation embedded in a `StudentResource` (`school_class`, whenLoaded). */
interface StudentClassPayload {
  id: number | string;
  name: string | null;
}

/** Shape of the backend `StudentResource` connected to a tutor (snake_case). */
interface ConnectedStudentPayload {
  id: number | string;
  matricule: string | null;
  full_name: string | null;
  gender: string | null;
  image: string | null;
  school_class?: StudentClassPayload | null;
}

/** The `show` endpoint returns `data.tutor` — a `TutorResource` with `students` loaded. */
interface TutorShowPayload extends TutorPayload {
  students?: ConnectedStudentPayload[] | null;
}

/** The `show` endpoint envelope's `data` object. */
interface TutorShowData {
  tutor: TutorShowPayload;
}

/** The tutors index nests the paginated rows under `data.tutors` (not a bare array). */
interface TutorIndexPayload {
  tutors: TutorPayload[];
  totalParents?: number;
  totalStudentsWithParent?: number;
  totalStudentsWithoutParent?: number;
}

function mapConnectedStudent(s: ConnectedStudentPayload): ConnectedStudent {
  return {
    id: String(s.id),
    matricule: s.matricule ?? null,
    fullName: s.full_name ?? "",
    gender: s.gender ?? null,
    className: s.school_class?.name ?? null,
    imageUrl: s.image ?? null,
  };
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

  async get(id: string): Promise<ParentDetail> {
    // `show` returns `{ tutor, school }`; the tutor carries its school-scoped `students`.
    const data = await api.get<TutorShowData>(`/dashboard/tutors/${id}`);
    const tutor = data.tutor;
    const base = mapTutor(tutor);
    const connectedStudents = (tutor.students ?? []).map(mapConnectedStudent);
    return {
      ...base,
      childrenCount: connectedStudents.length,
      isApproved: Boolean(tutor.is_approved),
      connectedStudents,
    };
  },

  async stats(): Promise<ParentStats> {
    // The stat totals live on the index payload (`data`), not the paginated rows.
    const res = await api.list<TutorPayload>("/dashboard/tutors?page=1");
    const payload = res.data as unknown as TutorIndexPayload;
    return {
      totalParents: payload?.totalParents ?? 0,
      totalStudentsWithParent: payload?.totalStudentsWithParent ?? 0,
      totalStudentsWithoutParent: payload?.totalStudentsWithoutParent ?? 0,
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

  async exportUnattached(): Promise<void> {
    // Streams a PDF of students with no linked parent (not the JSON envelope).
    await downloadFile("/dashboard/tutors/export-unattached", {
      fallbackName: "unattached-students.pdf",
    });
  },
};
