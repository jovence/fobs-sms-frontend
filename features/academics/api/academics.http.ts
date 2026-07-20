import { api } from "@/lib/api-client";
import type { Paginated } from "@/types";
import type {
  ClassLevel,
  ClassSection,
  ClassStats,
  SchoolClass,
  SchoolClassInput,
  Subject,
  SubjectClassAssignment,
  SubjectInput,
  SubjectLevel,
  SubjectSeries,
} from "../types";
import type {
  ClassesService,
  ClassOption,
  SubjectListResult,
  SubjectsService,
} from "./academics.service";

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
  // Present only when the `classMaster` relation is eager-loaded (index); {id,name} of the teacher.
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
    // Prefer the eager-loaded teacher's name for display; fall back to the raw column.
    classMaster: p.class_master_teacher?.name ?? p.class_master ?? null,
    classMasterId: p.class_master_teacher ? String(p.class_master_teacher.id) : null,
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
 * one payload builder serve create + update. The class master is now a teacher picker, so we send
 * the teacher name as `class_master` (create path) and the teacher id as `class_master_id`
 * (update path), derived from the selected teacher.
 */
function toClassPayload(input: SchoolClassInput): Record<string, unknown> {
  const id = input.classMasterId?.trim() || null;
  const name = input.classMasterName?.trim() || null;
  return {
    name: input.name.trim(),
    level: input.level,
    section: input.section,
    class_master: name,
    class_master_id: id,
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
  async stats(): Promise<ClassStats> {
    // The backend exposes no classes-stats endpoint, so aggregate across every page. Classes are
    // fixed at 15/page; the first response gives the (unfiltered) total + page count, then the
    // remaining pages are fetched in parallel and reduced.
    const first = await api.list<SchoolClassPayload>("/dashboard/classes?page=1");
    const totalClasses = first.meta?.total ?? first.data.length;
    const lastPage = first.meta?.last_page ?? 1;
    let rows = first.data.map(mapClass);
    if (lastPage > 1) {
      const rest = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, i) =>
          api.list<SchoolClassPayload>(`/dashboard/classes?page=${i + 2}`),
        ),
      );
      rows = rows.concat(rest.flatMap((r) => r.data.map(mapClass)));
    }
    return {
      totalClasses,
      upperCount: rows.filter((r) => r.level === "upper").length,
      lowerCount: rows.filter((r) => r.level === "lower").length,
      totalStudents: rows.reduce((sum, r) => sum + r.studentsCount, 0),
    };
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

/**
 * The subjects `show` endpoint payload: the subject plus every school class keyed by id, each with
 * its `assigned` flag and pivot fields (mirrors the web edit screen).
 */
interface SubjectShowPayload {
  subject: SubjectPayload;
  classes: Record<
    string,
    {
      name: string;
      level: string | null;
      assigned: boolean;
      coefficient: number | null;
      min_weekly_hours: number | null;
      teacher_id: number | string | null;
    }
  >;
  levels: string[];
}

function mapSubject(p: SubjectPayload): Subject {
  return {
    id: String(p.id),
    name: p.name,
    code: p.code,
    series: p.series as SubjectSeries,
    level: (p.level as SubjectLevel | null) ?? null,
    // classes are not eager-loaded on the list endpoint → defaults to 0 there.
    classesCount: p.classes?.length ?? 0,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/**
 * Build the backend `store`/`update` payload. The backend requires a non-empty `classes` array
 * keyed by class id (`{ [classId]: { assigned, coefficient, min_weekly_hours, teacher_id } }`) and
 * derives the subject `level` from the assigned classes, so we only send the assigned rows. `series`
 * is still required and sent as-is.
 */
function toSubjectPayload(input: SubjectInput): Record<string, unknown> {
  const classes: Record<string, unknown> = {};
  for (const c of input.classes) {
    if (!c.assigned) continue;
    classes[c.classId] = {
      assigned: true,
      coefficient: c.coefficient,
      min_weekly_hours: c.minWeeklyHours,
      teacher_id: c.teacherId || null,
    };
  }
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    series: input.series,
    classes,
  };
}

export const httpSubjectsService: SubjectsService = {
  async list(query): Promise<SubjectListResult> {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    params.set("per_page", String(query.perPage));
    if (query.search) params.set("search", query.search);
    if (query.series) params.set("series", query.series);
    if (query.level) params.set("level", query.level);
    // NOTE: sortBy/sortDir have no backend equivalent — ignored.
    // The index `data` is an object (not an array), so read it via api.list to also get `meta`
    // (the paginator's filtered total) which api.get would drop.
    const { data, meta } = await api.list<never>(`/dashboard/subjects?${params.toString()}`);
    const payload = data as unknown as SubjectIndexPayload;
    const filteredTotal = meta?.total ?? payload.totalSubjects;
    return {
      items: payload.subjects.map(mapSubject),
      page: meta?.current_page ?? query.page,
      perPage: meta?.per_page ?? query.perPage,
      total: filteredTotal,
      totalPages: meta?.last_page ?? (Math.ceil(filteredTotal / query.perPage) || 1),
      stats: {
        totalSubjects: payload.totalSubjects,
        artCount: payload.artCount,
        scienceCount: payload.scienceCount,
      },
    };
  },
  async options(): Promise<ClassOption[]> {
    const { data } = await api.list<never>("/dashboard/subjects?per_page=200");
    const payload = data as unknown as SubjectIndexPayload;
    return payload.subjects.map((s) => ({ id: String(s.id), name: s.name }));
  },
  async getAssignments(id): Promise<SubjectClassAssignment[]> {
    const payload = await api.get<SubjectShowPayload>(`/dashboard/subjects/${id}`);
    return Object.entries(payload.classes)
      .filter(([, c]) => c.assigned)
      .map(([classId, c]) => ({
        classId: String(classId),
        assigned: true,
        coefficient: c.coefficient ?? 1,
        minWeeklyHours: c.min_weekly_hours ?? 2,
        teacherId: c.teacher_id != null ? String(c.teacher_id) : null,
      }));
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
