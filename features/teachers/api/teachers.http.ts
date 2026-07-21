import { api } from "@/lib/api-client";
import { ApiError } from "@/types";
import type { Paginated } from "@/types";
import type {
  AssignClassesForm,
  AssignSubjectsForm,
  AssignedClass,
  AssignedSubject,
  Teacher,
  TeacherProfile,
  TeacherStatus,
  TeachingAssignment,
} from "../types";
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

/** Backend `SubjectResource` (snake_case). */
interface SubjectPayload {
  id: number | string;
  school_id: number | string;
  name: string;
  code: string | null;
  level: string | null;
  series: string | null;
  description: string | null;
  classes?: SchoolClassPayload[] | null;
}

/** Backend `StudentResource` (only `id`/`name`/`class_id` are serialized). */
interface StudentPayload {
  id: number | string;
  name: string | null;
  class_id: number | string | null;
}

/** Backend `SchoolClassResource` (snake_case). */
interface SchoolClassPayload {
  id: number | string;
  school_id: number | string;
  name: string;
  level: string | null;
  academic_year: string | null;
  section: string | null;
  students?: StudentPayload[] | null;
}

/** Backend `TeacherSchoolResource` — the active-school pivot with timestamps. */
interface TeacherSchoolPayload {
  isActive: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** One `assignmentsByClass` entry: a class and the subjects taught in it. */
interface AssignmentByClassPayload {
  class: SchoolClassPayload | null;
  subjects: SubjectPayload[];
}

/** Shape of the `show` endpoint payload (teacher + assignment summary + teaching assignments). */
interface TeacherShowPayload {
  teacher: TeacherPayload;
  teacherSchool: TeacherSchoolPayload | null;
  totalSubjects: number;
  totalClasses: number;
  totalAssignments: number;
  totalStudents: number;
  assignmentsByClass: AssignmentByClassPayload[];
}

/** Shape of the `assign-subjects` GET payload. */
interface AssignSubjectsFormPayload {
  teacher: TeacherPayload;
  assignedSubjects: SubjectPayload[];
  assignedSubjectIds: (number | string)[];
  availableSubjects: SubjectPayload[];
}

/**
 * Shape of the `assign-classes` GET payload. `teacherSubjects` each carry their available
 * `classes`; `currentAssignments` is grouped `{ [subject_id]: { [class_id]: rows[] } }`.
 */
interface AssignClassesFormPayload {
  teacher: TeacherPayload;
  teacherSubjects: SubjectPayload[];
  assignedClasses: SchoolClassPayload[];
  assignedClassIds: (number | string)[];
  currentAssignments: Record<string, Record<string, unknown[]>>;
}

function mapSubject(p: SubjectPayload): AssignedSubject {
  return {
    id: String(p.id),
    name: p.name ?? "",
    code: p.code,
    level: p.level,
    series: p.series,
  };
}

function studentCount(c: SchoolClassPayload | null | undefined): number {
  return c && Array.isArray(c.students) ? c.students.length : 0;
}

function mapClass(p: SchoolClassPayload, count = studentCount(p)): AssignedClass {
  return {
    id: String(p.id),
    name: p.name ?? "",
    level: p.level,
    academicYear: p.academic_year,
    section: p.section,
    studentCount: count,
  };
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

  async get(id): Promise<TeacherProfile> {
    // `show` carries counts, classes (with students) and assignmentsByClass, but the
    // TeacherResource omits the subjects relation — pull the assigned subjects from the
    // subjects-form endpoint so the profile can list & remove them.
    const [show, subjectForm] = await Promise.all([
      api.get<TeacherShowPayload>(`/dashboard/teachers/${id}`),
      api.get<AssignSubjectsFormPayload>(`/dashboard/teachers/${id}/assign-subjects`),
    ]);

    const t = show.teacher;
    const active = show.teacherSchool?.isActive !== false;

    // Student counts are only eager-loaded on the teacher's own classes; reuse them for the
    // assignmentsByClass table (whose classes carry no students).
    const classes = Array.isArray(t.school_classes)
      ? (t.school_classes as SchoolClassPayload[]).map((c) => mapClass(c))
      : [];
    const studentCountByClass = new Map(classes.map((c) => [c.id, c.studentCount]));

    const assignments: TeachingAssignment[] = (show.assignmentsByClass ?? [])
      .filter((a): a is AssignmentByClassPayload & { class: SchoolClassPayload } => a.class != null)
      .map((a) => {
        const classId = String(a.class.id);
        return {
          classId,
          className: a.class.name ?? "",
          studentCount: studentCountByClass.get(classId) ?? studentCount(a.class),
          subjects: a.subjects.map(mapSubject),
        };
      });

    return {
      id: String(t.id),
      name: t.name ?? "",
      email: t.email ?? "",
      phone: t.phone ?? "",
      address: t.address ?? "",
      specialization: t.specialization ?? "",
      qualifications: t.qualifications ?? "",
      experienceYears: toNumber(t.experience),
      bio: t.bio ?? "",
      avatarUrl: t.profile_photo,
      status: active ? "active" : "pending",
      joinedAt: show.teacherSchool?.created_at ?? t.created_at ?? new Date().toISOString(),
      approvedAt: active ? (show.teacherSchool?.updated_at ?? null) : null,
      totalSubjects: show.totalSubjects,
      totalClasses: show.totalClasses,
      totalAssignments: show.totalAssignments,
      totalStudents: show.totalStudents,
      subjects: subjectForm.assignedSubjects.map(mapSubject),
      classes,
      assignments,
    };
  },

  async assignSubjectsForm(id): Promise<AssignSubjectsForm> {
    const data = await api.get<AssignSubjectsFormPayload>(`/dashboard/teachers/${id}/assign-subjects`);
    return {
      teacherName: data.teacher.name ?? "",
      assignedSubjectIds: data.assignedSubjectIds.map(String),
      availableSubjects: data.availableSubjects.map(mapSubject),
    };
  },

  async assignSubjects(id, subjectIds): Promise<void> {
    // Backend expects `subjects` = array of subject ids (the full desired set).
    await api.post<null>(`/dashboard/teachers/${id}/assign-subjects`, { subjects: subjectIds });
  },

  async removeSubject(id, subjectId): Promise<void> {
    await api.post<null>(`/dashboard/teachers/${id}/subjects/${subjectId}`);
  },

  async assignClassesForm(id): Promise<AssignClassesForm> {
    const data = await api.get<AssignClassesFormPayload>(`/dashboard/teachers/${id}/assign-classes`);

    const groups = data.teacherSubjects.map((subject) => {
      const subjectId = String(subject.id);
      const current = data.currentAssignments?.[subjectId] ?? {};
      return {
        subjectId,
        subjectName: subject.name ?? "",
        classes: (subject.classes ?? []).map((c) => ({
          id: String(c.id),
          name: c.name ?? "",
          level: c.level,
          academicYear: c.academic_year,
        })),
        // Keys of `currentAssignments[subjectId]` are the class ids checked for this subject.
        assignedClassIds: Object.keys(current),
      };
    });

    return {
      teacherName: data.teacher.name ?? "",
      assignedClasses: data.assignedClasses.map((c) => mapClass(c)),
      subjects: groups,
    };
  },

  async assignClasses(id, assignments): Promise<void> {
    // Backend expects `assignments[]` of `{ subject_id, classes[] }`; it filters out empty ones.
    await api.post<null>(`/dashboard/teachers/${id}/assign-classes`, {
      assignments: assignments
        .filter((a) => a.classIds.length > 0)
        .map((a) => ({ subject_id: a.subjectId, classes: a.classIds })),
    });
  },

  async removeClass(id, classId): Promise<void> {
    await api.post<null>(`/dashboard/teachers/${id}/classes/${classId}/remove`);
  },
};
