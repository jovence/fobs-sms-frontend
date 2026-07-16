import { api } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";
import { ApiError } from "@/types";
import type { Paginated } from "@/types";
import type {
  EntrySelection,
  EntryStudent,
  ReportQuery,
  ReportRow,
  SaveMarksInput,
} from "../types";
import type { MarksService } from "./marks.service";

/**
 * Live implementation of {@link MarksService} against the Laravel backend.
 *
 * Mark entry (read the saved marks / save marks) maps onto the Teacher-app
 * `MarkController` endpoints (`/api/marks`, filtered by school + class + subject +
 * exam). The report-card *listing* and *generation* flows this interface models
 * (per-student aggregated averages/ranks/decisions, and fire-and-forget PDF
 * generation) have no matching JSON endpoint in the route list: the backend's
 * `/dashboard/reports` index returns filter metadata (classes + academic years)
 * only, and every generate/download endpoint is keyed by a term / sequence /
 * academic-year that this interface's params do not carry — so those methods
 * throw a typed 501. See the per-method NOTEs.
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

export const httpMarksService: MarksService = {
  /**
   * NOTE (gap): no backend endpoint returns paginated per-student report rows
   * with average / rank / decision. `GET /dashboard/reports` returns only filter
   * metadata (classes + academic years); the preview endpoints require a term /
   * sequence (absent from ReportQuery) and still do not expose those aggregates
   * as JSON — they are computed inside the PDF templates.
   */
  async listReportRows(_query: ReportQuery): Promise<Paginated<ReportRow>> {
    throw new ApiError(
      "Report-card listing is not available over the API yet.",
      "unknown",
      501,
    );
  },

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

  /**
   * NOTE (gap): the report-generation / download endpoints are keyed by
   * `{student, term, academic_year}` (or sequence/annual variants). This method
   * receives only a student id, so there is no term / academic-year to target a
   * generate or download call — no matching endpoint.
   */
  async generateReportCard(_id: string): Promise<void> {
    throw new ApiError(
      "Generating a single report card is not available over the API yet.",
      "unknown",
      501,
    );
  },

  /**
   * NOTE (gap): `POST /dashboard/reports/generate` requires a `term` (1..3),
   * which ReportQuery does not carry (only an optional classId), so a bulk
   * generation call cannot be formed from the current filter.
   */
  async generateAll(_query: ReportQuery): Promise<void> {
    throw new ApiError(
      "Bulk report-card generation is not available over the API yet.",
      "unknown",
      501,
    );
  },
};
