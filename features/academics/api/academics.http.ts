import { api } from "@/lib/api-client";
import type { Paginated } from "@/types";
import type {
  ClassLevel,
  ClassSection,
  SchoolClass,
  SchoolClassInput,
  Subject,
  SubjectInput,
  SubjectSeries,
} from "../types";
import type { ClassesService, ClassOption, SubjectsService } from "./academics.service";

/**
 * Live implementation of {@link ClassesService} / {@link SubjectsService} against the Laravel
 * backend (`/api/dashboard/classes`, `/api/dashboard/subjects`, active-school scoped via the
 * `X-School-Id` header attached by lib/api-client). Mirrors the structure of schools.http.ts:
 * a snake_case payload interface, a snake→camel mapper, a write `toPayload`, and an object
 * implementing the service interface through `api.*`.
 */

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

/** Shape of the backend `SchoolClassResource` (snake_case, `id` numeric). */
interface SchoolClassPayload {
  id: number | string;
  name: string;
  level: string;
  section: string;
  academic_year: string | null;
  class_master: string | null;
  // Present only on the index (withCount('students')); omitted on show/create/update.
  students_count?: number | null;
  class_master_teacher?: { id: number | string; name: string } | null;
  created_at: string | null;
}

function mapClass(p: SchoolClassPayload): SchoolClass {
  return {
    id: String(p.id),
    name: p.name,
    level: p.level as ClassLevel,
    section: p.section as ClassSection,
    academicYear: p.academic_year ?? "",
    classMaster: p.class_master ?? null,
    // students_count is only loaded on the list endpoint; default to 0 elsewhere.
    studentsCount: p.students_count ?? 0,
    // NOTE: the backend resource exposes no subjects_count — defaulted to 0.
    subjectsCount: 0,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/**
 * The create endpoint validates `class_master`; the update endpoint validates `class_master_id`.
 * Laravel's `validate()` strips unvalidated keys, so sending both is safe on either call and lets
 * one payload builder serve create + update.
 * NOTE: the frontend `classMaster` field is a free-text name, whereas the backend update path
 * treats `class_master_id` as a teacher id — a real shape mismatch flagged in the summary.
 */
function toClassPayload(input: SchoolClassInput): Record<string, unknown> {
  const master = input.classMaster?.trim() || null;
  return {
    name: input.name.trim(),
    level: input.level,
    section: input.section,
    class_master: master,
    class_master_id: master,
  };
}

export const httpClassesService: ClassesService = {
  async list(query): Promise<Paginated<SchoolClass>> {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    // NOTE: the backend paginates classes at a fixed 15/page and ignores per_page; sent anyway.
    params.set("per_page", String(query.perPage));
    if (query.search) params.set("search", query.search);
    if (query.level) params.set("level", query.level);
    // NOTE: sortBy/sortDir have no backend equivalent (server orders by name) — ignored.
    const { data, meta } = await api.list<SchoolClassPayload>(
      `/dashboard/classes?${params.toString()}`,
    );
    return {
      items: data.map(mapClass),
      page: meta?.current_page ?? query.page,
      perPage: meta?.per_page ?? query.perPage,
      total: meta?.total ?? data.length,
      totalPages: meta?.last_page ?? 1,
    };
  },
  async options(): Promise<ClassOption[]> {
    // Reuse the list endpoint. NOTE: capped at the backend's fixed 15/page for the active school.
    const { data } = await api.list<SchoolClassPayload>("/dashboard/classes?per_page=200");
    return data.map((c) => ({ id: String(c.id), name: c.name }));
  },
  async create(input): Promise<SchoolClass> {
    const cls = await api.post<SchoolClassPayload>("/dashboard/classes", toClassPayload(input));
    return mapClass(cls);
  },
  async update(id, input): Promise<SchoolClass> {
    const cls = await api.put<SchoolClassPayload>(
      `/dashboard/classes/${id}`,
      toClassPayload(input),
    );
    return mapClass(cls);
  },
  async remove(id): Promise<void> {
    await api.delete<null>(`/dashboard/classes/${id}`);
  },
  async bulkRemove(ids): Promise<void> {
    // No bulk endpoint — compose from the single-delete route.
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/classes/${id}`)));
  },
};

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

/** Shape of the backend `SubjectResource` (snake_case, `id` numeric). */
interface SubjectPayload {
  id: number | string;
  name: string;
  code: string;
  series: string;
  level?: string | null;
  description?: string | null;
  // Only present when the `classes` relation is eager-loaded (edit/show), not on the index.
  classes?: Array<{
    id: number | string;
    name: string;
    level: string | null;
    coefficient: number | null;
    min_weekly_hours: number | null;
    teacher_id: number | string | null;
  }>;
  created_at: string | null;
}

/**
 * The subjects index returns a non-standard `data` object (not a bare array):
 * `{ subjects, totalSubjects, artCount, scienceCount }`, with pagination in `meta`.
 */
interface SubjectIndexPayload {
  subjects: SubjectPayload[];
  totalSubjects: number;
  artCount: number;
  scienceCount: number;
}

function mapSubject(p: SubjectPayload): Subject {
  return {
    id: String(p.id),
    name: p.name,
    code: p.code,
    series: p.series as SubjectSeries,
    // classes are not eager-loaded on the list endpoint → defaults to 0 there.
    classesCount: p.classes?.length ?? 0,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/**
 * NOTE: the backend store/update endpoints ALSO require a non-empty `classes` array (with
 * per-class coefficient / min_weekly_hours / teacher_id). The frontend `SubjectInput` carries
 * none of that, so create/update will 422 until the subject form is extended. We send the
 * fields we do have; the mapping is correct, the frontend contract is incomplete.
 */
function toSubjectPayload(input: SubjectInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    series: input.series,
  };
}

export const httpSubjectsService: SubjectsService = {
  async list(query): Promise<Paginated<Subject>> {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    params.set("per_page", String(query.perPage));
    if (query.search) params.set("search", query.search);
    if (query.series) params.set("series", query.series);
    // NOTE: sortBy/sortDir have no backend equivalent — ignored.
    const payload = await api.get<SubjectIndexPayload>(
      `/dashboard/subjects?${params.toString()}`,
    );
    const total = payload.totalSubjects;
    return {
      items: payload.subjects.map(mapSubject),
      page: query.page,
      perPage: query.perPage,
      total,
      totalPages: Math.ceil(total / query.perPage) || 1,
    };
  },
  async options(): Promise<ClassOption[]> {
    const payload = await api.get<SubjectIndexPayload>("/dashboard/subjects?per_page=200");
    return payload.subjects.map((s) => ({ id: String(s.id), name: s.name }));
  },
  async create(input): Promise<Subject> {
    const subject = await api.post<SubjectPayload>(
      "/dashboard/subjects",
      toSubjectPayload(input),
    );
    return mapSubject(subject);
  },
  async update(id, input): Promise<Subject> {
    const subject = await api.put<SubjectPayload>(
      `/dashboard/subjects/${id}`,
      toSubjectPayload(input),
    );
    return mapSubject(subject);
  },
  async remove(id): Promise<void> {
    await api.delete<null>(`/dashboard/subjects/${id}`);
  },
  async bulkRemove(ids): Promise<void> {
    // No bulk endpoint — compose from the single-delete route.
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/subjects/${id}`)));
  },
};
