import { api, downloadFile } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";
import type {
  EntrySelection,
  EntryStudent,
  ReportDownloadParams,
  ReportGenerateResult,
  ReportIndex,
  ReportMode,
  ReportParams,
  ReportPreview,
  ReportPreviewStudent,
  SaveMarksInput,
} from "../types";
import type { MarksService } from "./marks.service";

/**
 * Live implementation of {@link MarksService} against the Laravel backend.
 *
 * Mark entry (read the saved marks / save marks) maps onto the Teacher-app
 * `MarkController` endpoints (`/api/marks`, filtered by school + class + subject +
 * exam). Report cards map onto the owner-dashboard `ReportController`
 * (`/api/dashboard/reports[...]`); tenancy travels in the `X-School-Id` header
 * (see lib/api-client). Preview/generate are JSON; the ZIP/PDF downloads are
 * binary GET streams handled by {@link downloadFile}.
 */

/** The active school (backend requires `school_id` as an explicit param on `/marks`). */
function activeSchoolId(): string {
  return useAuthStore.getState().session?.activeSchoolId ?? "";
}

/** Shape of the backend `MarkResource` (snake_case, numeric ids). */
interface MarkPayload {
  id: number | string;
  school_id: number | string;
  student_id: number | string;
  class_id: number | string;
  subject_id: number | string;
  exam_id: number | string;
  academic_year: string | null;
  mark: number | string | null;
  // Only present when the backend eager-loads the relation (the index does not).
  student?: {
    id: number | string;
    full_name?: string | null;
    matricule?: string | null;
  } | null;
}

/** Coerce the backend `mark` (may arrive as a numeric string) to a number | null. */
function toMark(value: number | string | null): number | null {
  if (value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Map one `MarkResource` onto an {@link EntryStudent}. NOTE: the `/marks` index
 * does not eager-load `student`, so `fullName`/`matricule` are unavailable here —
 * they fall back to "" / null. Populating them (and listing students who have no
 * mark yet) needs the backend to eager-load `student` on the index, or a separate
 * class-roster endpoint (out of this module's route list).
 */
function mapEntryStudent(p: MarkPayload): EntryStudent {
  return {
    id: String(p.student_id),
    fullName: p.student?.full_name ?? "",
    matricule: p.student?.matricule ?? null,
    mark: toMark(p.mark),
  };
}

// ---------------------------------------------------------------------------
// Report cards
// ---------------------------------------------------------------------------

/** Backend `SchoolClass` (only id + name are used here). */
interface RawClass {
  id: number | string;
  name: string;
}

/** `GET /dashboard/reports` — filter metadata (identical for term/sequence/annual). */
interface RawReportIndex {
  academicYears?: string[];
  currentAcademicYear?: string;
  classes?: RawClass[];
}

/** A student row as serialised by the preview actions (Eloquent model → JSON). */
interface RawStudent {
  id: number | string;
  full_name?: string | null;
  matricule?: string | null;
  class_id?: number | string;
  subjects_count?: number; // term / sequence previews
  marks_count?: number; // annual preview
  class?: { id: number | string; name?: string | null } | null;
}

interface RawTermPreview {
  students: RawStudent[];
  total_subjects: number;
  term: number | string;
  academic_year: string;
}

interface RawSequencePreview {
  data: {
    students: RawStudent[];
    total_subjects: number;
    sequence: number | string;
    academic_year: string;
  };
  errors: string[];
}

interface RawAnnualPreview {
  students: RawStudent[];
  academic_year: string;
}

function mapPreviewStudent(
  s: RawStudent,
  count: number,
  total: number | null,
): ReportPreviewStudent {
  return {
    id: String(s.id),
    fullName: s.full_name ?? "",
    matricule: s.matricule ?? null,
    className: s.class?.name ?? "",
    subjectsCount: count,
    totalSubjects: total,
    // Term/sequence: short of the subject count. Annual: no total → "no marks".
    missing: total != null ? count < total : count === 0,
  };
}

/** Body for preview/generate — omit `class_id` when no class filter is chosen. */
function reportBody(mode: ReportMode, params: ReportParams): Record<string, unknown> {
  const base: Record<string, unknown> = {};
  if (params.classId) base.class_id = params.classId;
  if (mode === "term") base.term = params.term;
  if (mode === "sequence") base.sequence = params.sequence;
  return base;
}

export const httpMarksService: MarksService = {
  /**
   * Read the saved marks for a Class + Subject + Exam. NOTE: the `/marks` index
   * only returns students who already have a mark (un-marked students are absent)
   * and does not include the student's name (see {@link mapEntryStudent}).
   */
  async listEntryRoster(selection: EntrySelection): Promise<EntryStudent[]> {
    const params = new URLSearchParams({
      school_id: activeSchoolId(),
      exam_id: selection.examId,
      subject_id: selection.subjectId,
      class_id: selection.classId,
    });
    const marks = await api.get<MarkPayload[]>(`/marks?${params.toString()}`);
    return marks.map(mapEntryStudent);
  },

  /** Persist entered marks — the store endpoint takes one mark per call. */
  async saveMarks(input: SaveMarksInput): Promise<void> {
    const schoolId = activeSchoolId();
    await Promise.all(
      input.marks.map(({ studentId, mark }) =>
        api.post<MarkPayload>("/marks", {
          school_id: schoolId,
          class_id: input.classId,
          subject_id: input.subjectId,
          exam_id: input.examId,
          student_id: studentId,
          mark,
        }),
      ),
    );
  },

  async reportIndex(): Promise<ReportIndex> {
    const data = await api.get<RawReportIndex>("/dashboard/reports");
    return {
      academicYears: data.academicYears ?? [],
      currentAcademicYear: data.currentAcademicYear ?? "",
      classes: (data.classes ?? []).map((c) => ({ id: String(c.id), name: c.name })),
    };
  },

  async previewReport(mode: ReportMode, params: ReportParams): Promise<ReportPreview> {
    if (mode === "sequence") {
      const raw = await api.post<RawSequencePreview>(
        "/dashboard/reports/sequence/preview",
        reportBody(mode, params),
      );
      const d = raw.data;
      return {
        students: d.students.map((s) =>
          mapPreviewStudent(s, s.subjects_count ?? 0, d.total_subjects),
        ),
        totalSubjects: d.total_subjects,
        academicYear: d.academic_year,
        sequence: Number(d.sequence),
        errors: raw.errors ?? [],
      };
    }

    if (mode === "annual") {
      const raw = await api.post<RawAnnualPreview>(
        "/dashboard/reports/annual/preview",
        reportBody(mode, params),
      );
      return {
        students: raw.students.map((s) =>
          mapPreviewStudent(s, s.marks_count ?? 0, null),
        ),
        totalSubjects: null,
        academicYear: raw.academic_year,
        errors: [],
      };
    }

    const raw = await api.post<RawTermPreview>(
      "/dashboard/reports/preview",
      reportBody(mode, params),
    );
    return {
      students: raw.students.map((s) =>
        mapPreviewStudent(s, s.subjects_count ?? 0, raw.total_subjects),
      ),
      totalSubjects: raw.total_subjects,
      academicYear: raw.academic_year,
      term: Number(raw.term),
      errors: [],
    };
  },

  async generateReport(
    mode: ReportMode,
    params: ReportParams,
  ): Promise<ReportGenerateResult> {
    const path =
      mode === "sequence"
        ? "/dashboard/reports/sequence/generate"
        : mode === "annual"
          ? "/dashboard/reports/annual/generate"
          : "/dashboard/reports/generate";
    // The backend wraps the generation result in the envelope; `data` carries
    // `{ success, message, ... }` — surface its message to the caller.
    const data = await api.post<{ message?: string }>(path, reportBody(mode, params));
    return { message: data?.message ?? "" };
  },

  async downloadAllReports(
    mode: ReportMode,
    params: ReportDownloadParams,
  ): Promise<void> {
    const year = encodeURIComponent(params.academicYear);
    const cls = params.classId ? `?class_id=${encodeURIComponent(params.classId)}` : "";
    const path =
      mode === "sequence"
        ? `/dashboard/reports/sequence/download-all/${params.sequence}/${year}${cls}`
        : mode === "annual"
          ? `/dashboard/reports/annual/download-all/${year}${cls}`
          : `/dashboard/reports/download-all/${params.term}/${year}${cls}`;
    await downloadFile(path, { method: "GET", fallbackName: `report-cards-${mode}.zip` });
  },

  async downloadStudentReport(
    mode: ReportMode,
    params: ReportDownloadParams,
  ): Promise<void> {
    const year = encodeURIComponent(params.academicYear);
    const student = params.studentId ?? "";
    const path =
      mode === "sequence"
        ? `/dashboard/reports/sequence/download/${student}/${params.sequence}/${year}`
        : mode === "annual"
          ? `/dashboard/reports/annual/download/${student}/${year}`
          : `/dashboard/reports/download/${student}/${params.term}/${year}`;
    await downloadFile(path, {
      method: "GET",
      fallbackName: `report-card-${student}.pdf`,
    });
  },
};
