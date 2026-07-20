import { api } from "@/lib/api-client";
import type { Paginated } from "@/types";
import type {
  Exam,
  ExamClassPerformance,
  ExamDashboard,
  ExamInput,
  ExamSubjectClassBreakdown,
  ExamSubjectStat,
  Term,
} from "../types";
import type { ExamsService } from "./exams.service";

/**
 * Live implementation of {@link ExamsService} against the Laravel backend
 * (`/api/dashboard/exams`, tenancy via `X-School-Id`). Maps the snake_case
 * `ExamResource` payload onto the UI's camelCase {@link Exam} type.
 */

/** Shape of the backend `ExamResource` (snake_case, `id`/`school_id` numeric). */
interface ExamPayload {
  id: number | string;
  school_id: number | string | null;
  name: string;
  term: string | null;
  academic_year: string | null;
  sequence: number | null;
  mark_entry_allowed: boolean;
  is_published: boolean;
  created_at: string | null;
  updated_at?: string | null;
}

const TERMS: readonly Term[] = ["First", "Second", "Third"];

function toTerm(value: string | null): Term {
  return TERMS.includes(value as Term) ? (value as Term) : "First";
}

function mapExam(p: ExamPayload): Exam {
  return {
    id: String(p.id),
    name: p.name,
    term: toTerm(p.term),
    // Backend `store` validation does not accept `sequence`, so newly created
    // exams come back with `sequence` null → default 0.
    sequence: p.sequence ?? 0,
    academicYear: p.academic_year ?? "",
    published: p.is_published,
    markEntryAllowed: p.mark_entry_allowed,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/** Payload for POST /dashboard/exams. `academic_year`/`sequence` are not part of `ExamInput`. */
function toCreatePayload(input: ExamInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    term: input.term,
    is_published: input.published,
    mark_entry_allowed: input.markEntryAllowed,
  };
}

/** Today's date as YYYY-MM-DD, to satisfy the update endpoint's required `start_date`. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Payload for PUT /dashboard/exams/{id}. The backend requires `start_date` (a required|date
 * field the frontend does not model and the Exam model does not persist); we send today's date
 * purely to pass validation — it is dropped on the (non-fillable) mass-assignment.
 */
function toUpdatePayload(input: ExamInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    term: input.term,
    is_published: input.published,
    mark_entry_allowed: input.markEntryAllowed,
    start_date: today(),
  };
}

/** Minimal shape of a raw `SchoolClass`/`Subject` Eloquent model nested in the dashboard payload. */
interface ClassPayload {
  id: number | string;
  name: string | null;
}
interface SubjectPayload {
  id: number | string;
  name: string | null;
  code?: string | null;
}

/** Shape of a `classesList` entry (snake_case; nested `class` is a raw model). */
interface ClassStatPayload {
  class: ClassPayload;
  students_count: number;
  total_marks: number;
  average_mark: number;
  passed: number;
  failed: number;
  pass_rate: number;
}

/** Shape of a subject's `class_breakdown` entry. */
interface ClassBreakdownPayload {
  class: ClassPayload;
  total_students: number;
  marks_entered: number;
  marks_pending: number;
  completion_rate: number;
  has_marks: boolean;
}

/** Shape of a `subjectStats` entry. */
interface SubjectStatPayload {
  subject: SubjectPayload;
  marks_entered: number;
  students_assessed: number;
  total_expected: number;
  average_mark: number;
  highest_mark: number | null;
  lowest_mark: number | null;
  pass_rate: number;
  submitted: boolean;
  exam_date: string | null;
  class_breakdown: ClassBreakdownPayload[];
}

/** Shape of the whole `show` payload: the exam plus the compacted dashboard analytics. */
interface DashboardPayload {
  exam: ExamPayload;
  totalSubjects: number;
  submittedSubjects: number;
  pendingSubjects: number;
  totalMarksEntered: number;
  totalExpectedMarks: number;
  completionRate: number;
  averageMark: number | null;
  highestMark: number | null;
  lowestMark: number | null;
  passRate: number;
  gradeDistribution: { A: number; B: number; C: number; D: number; E: number };
  classesList: ClassStatPayload[] | Record<string, ClassStatPayload>;
  subjectStats: SubjectStatPayload[] | Record<string, SubjectStatPayload>;
}

/** Collections keyed by non-sequential ids serialise as objects — normalise back to an array. */
function toArray<T>(value: T[] | Record<string, T> | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : Object.values(value);
}

function mapClassStat(p: ClassStatPayload): ExamClassPerformance {
  return {
    classId: String(p.class?.id ?? ""),
    className: p.class?.name ?? "—",
    studentsCount: p.students_count ?? 0,
    totalMarks: p.total_marks ?? 0,
    averageMark: p.average_mark ?? 0,
    passed: p.passed ?? 0,
    failed: p.failed ?? 0,
    passRate: p.pass_rate ?? 0,
  };
}

function mapClassBreakdown(p: ClassBreakdownPayload): ExamSubjectClassBreakdown {
  return {
    classId: String(p.class?.id ?? ""),
    className: p.class?.name ?? "—",
    totalStudents: p.total_students ?? 0,
    marksEntered: p.marks_entered ?? 0,
    marksPending: p.marks_pending ?? 0,
    completionRate: p.completion_rate ?? 0,
    hasMarks: p.has_marks ?? false,
  };
}

function mapSubjectStat(p: SubjectStatPayload): ExamSubjectStat {
  return {
    subjectId: String(p.subject?.id ?? ""),
    subjectName: p.subject?.name ?? "—",
    subjectCode: p.subject?.code ?? null,
    marksEntered: p.marks_entered ?? 0,
    studentsAssessed: p.students_assessed ?? 0,
    totalExpected: p.total_expected ?? 0,
    averageMark: p.average_mark ?? 0,
    highestMark: p.highest_mark ?? null,
    lowestMark: p.lowest_mark ?? null,
    passRate: p.pass_rate ?? 0,
    submitted: p.submitted ?? false,
    examDate: p.exam_date ?? null,
    classBreakdown: toArray(p.class_breakdown).map(mapClassBreakdown),
  };
}

function mapDashboard(p: DashboardPayload): ExamDashboard {
  return {
    exam: mapExam(p.exam),
    totalSubjects: p.totalSubjects ?? 0,
    submittedSubjects: p.submittedSubjects ?? 0,
    pendingSubjects: p.pendingSubjects ?? 0,
    totalMarksEntered: p.totalMarksEntered ?? 0,
    totalExpectedMarks: p.totalExpectedMarks ?? 0,
    completionRate: p.completionRate ?? 0,
    averageMark: p.averageMark ?? 0,
    highestMark: p.highestMark ?? 0,
    lowestMark: p.lowestMark ?? 0,
    passRate: p.passRate ?? 0,
    gradeDistribution: p.gradeDistribution ?? { A: 0, B: 0, C: 0, D: 0, E: 0 },
    classes: toArray(p.classesList).map(mapClassStat),
    subjects: toArray(p.subjectStats).map(mapSubjectStat),
  };
}

export const httpExamsService: ExamsService = {
  async list(query) {
    const { data, meta } = await api.list<ExamPayload>(
      `/dashboard/exams?page=${query.page}&per_page=${query.perPage}`,
    );
    const items = data.map(mapExam);
    const perPage = meta?.per_page ?? query.perPage;
    const total = meta?.total ?? items.length;
    const paginated: Paginated<Exam> = {
      items,
      page: meta?.current_page ?? query.page,
      perPage,
      total,
      totalPages: meta?.last_page ?? (Math.ceil(total / perPage) || 1),
    };
    return paginated;
  },

  async options() {
    // No dedicated options endpoint — walk the paginated index (few exams per school).
    const first = await api.list<ExamPayload>("/dashboard/exams?page=1");
    const rows: ExamPayload[] = [...first.data];
    const lastPage = first.meta?.last_page ?? 1;
    for (let page = 2; page <= lastPage; page += 1) {
      const next = await api.list<ExamPayload>(`/dashboard/exams?page=${page}`);
      rows.push(...next.data);
    }
    return rows.map((e) => ({ id: String(e.id), name: e.name }));
  },

  async get(id) {
    // `show` wraps the exam under a `exam` key alongside extra dashboard data.
    const data = await api.get<{ exam: ExamPayload }>(`/dashboard/exams/${id}`);
    return mapExam(data.exam);
  },

  async create(input) {
    const exam = await api.post<ExamPayload>("/dashboard/exams", toCreatePayload(input));
    return mapExam(exam);
  },

  async update(id, input) {
    const exam = await api.put<ExamPayload>(`/dashboard/exams/${id}`, toUpdatePayload(input));
    return mapExam(exam);
  },

  async remove(id) {
    await api.delete<null>(`/dashboard/exams/${id}`);
  },

  async bulkRemove(ids) {
    // No bulk endpoint — fan out to the single-delete route.
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/exams/${id}`)));
  },

  async getDashboard(id) {
    const data = await api.get<DashboardPayload>(`/dashboard/exams/${id}`);
    return mapDashboard(data);
  },

  async togglePublish(id) {
    const exam = await api.patch<ExamPayload>(`/dashboard/exams/${id}/toggle-publish`);
    return mapExam(exam);
  },

  async toggleMarkFill(id) {
    const exam = await api.patch<ExamPayload>(`/dashboard/exams/${id}/toggle-mark-fill`);
    return mapExam(exam);
  },
};
