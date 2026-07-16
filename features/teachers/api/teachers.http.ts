import { api } from "@/lib/api-client";
import { ApiError } from "@/types";
import type { Paginated } from "@/types";
import type { Teacher, TeacherStatus } from "../types";
import type { TeachersService } from "./teachers.service";

/**
 * Live implementation of {@link TeachersService} against the Laravel backend
 * (`/api/dashboard/teachers`, owner-scoped via the `X-School-Id` tenancy header).
 * Maps the backend's snake_case `TeacherResource` payload onto the UI's camelCase
 * {@link Teacher} type. Follows the schools.http reference structure.
 */

/** A school pivot entry on the `TeacherResource` (only the active school is eager-loaded). */
interface TeacherSchoolPivotPayload {
  id: number | string;
  name: string;
  acronym: string;
  is_active: boolean;
}

/** Shape of the backend `TeacherResource` (snake_case, `id` numeric). */
interface TeacherPayload {
  id: number | string;
  user_id: number | string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  experience: number | string | null;
  address: string | null;
  bio: string | null;
  profile_photo: string | null;
  created_at: string | null;
  schools?: TeacherSchoolPivotPayload[] | null;
  school_classes?: unknown[] | null;
}

/** Shape of the `show` endpoint payload (teacher + assignment summary counts). */
interface TeacherShowPayload {
  teacher: TeacherPayload;
  teacherSchool: { isActive?: boolean } | null;
  totalSubjects: number;
  totalClasses: number;
}

function toNumber(value: number | string | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

/** The list/show query filters to a single active school; its pivot drives the UI status. */
function statusFromSchools(schools: TeacherSchoolPivotPayload[] | null | undefined): TeacherStatus {
  if (!schools || schools.length === 0) return "active";
  return schools[0].is_active ? "active" : "pending";
}

/**
 * Map a `TeacherResource` payload to the UI {@link Teacher}.
 * `subjectsCount`/`classesCount` can be supplied by callers that have the show-endpoint
 * counts; otherwise `classesCount` falls back to the eager-loaded `school_classes` length
 * and `subjectsCount` defaults to 0 (the list resource carries no subject count).
 */
function mapTeacher(
  p: TeacherPayload,
  counts?: { subjects: number; classes: number; status?: TeacherStatus },
): Teacher {
  return {
    id: String(p.id),
    name: p.name ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    specialization: p.specialization ?? "",
    qualifications: p.qualifications ?? "",
    experienceYears: toNumber(p.experience),
    status: counts?.status ?? statusFromSchools(p.schools),
    // The list resource has no subject count; default 0. `classesCount` uses the eager-loaded relation.
    subjectsCount: counts?.subjects ?? 0,
    classesCount: counts?.classes ?? (Array.isArray(p.school_classes) ? p.school_classes.length : 0),
    avatarUrl: p.profile_photo,
    joinedAt: p.created_at ?? new Date().toISOString(),
  };
}

export const httpTeachersService: TeachersService = {
  async list(query): Promise<Paginated<Teacher>> {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    params.set("per_page", String(query.perPage));
    if (query.search) params.set("search", query.search);
    // Backend supports active teachers (default) or inactive via `active=false`.
    // "pending" (awaiting approval) maps to the inactive pivot; "active" is the default.
    if (query.status === "pending") params.set("active", "false");

    const { data, meta } = await api.list<TeacherPayload>(`/dashboard/teachers?${params.toString()}`);
    const items = data.map((p) => mapTeacher(p));

    return {
      items,
      page: meta?.current_page ?? query.page,
      perPage: meta?.per_page ?? query.perPage,
      total: meta?.total ?? items.length,
      totalPages: meta?.last_page ?? 1,
    };
  },

  async approve(id): Promise<Teacher> {
    // Approve returns `null`; re-fetch the show endpoint to return the updated teacher.
    await api.patch<null>(`/dashboard/teachers/${id}/approve`);
    const show = await api.get<TeacherShowPayload>(`/dashboard/teachers/${id}`);
    return mapTeacher(show.teacher, {
      subjects: show.totalSubjects,
      classes: show.totalClasses,
      status: show.teacherSchool?.isActive === false ? "pending" : "active",
    });
  },

  async update(): Promise<Teacher> {
    // No backend endpoint updates a teacher's profile from the owner dashboard.
    throw new ApiError("Editing teacher profiles is not available yet.", "unknown", 501);
  },

  async remove(id): Promise<void> {
    await api.delete<null>(`/dashboard/teachers/${id}`);
  },

  async bulkRemove(ids): Promise<void> {
    // No bulk endpoint; detach each teacher through the single-delete route.
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/teachers/${id}`)));
  },
};
