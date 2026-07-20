/**
 * Marks & report cards domain types. Marks are scored out of 20 (Cameroon /
 * MINESEC convention); the pass mark is 10. A term maps to two sequences
 * (Term 1 = seq 1 & 2, Term 2 = seq 3 & 4, Term 3 = seq 5 & 6).
 */

export type Decision = "Passed" | "Conditional" | "Repeat";

/** Passed >= 10, Conditional >= 9, otherwise Repeat. */
export const PASS_MARK = 10;
export const CONDITIONAL_MARK = 9;
export const MARK_MAX = 20;

export interface ClassOption {
  id: string;
  name: string;
}

export interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

export interface ExamOption {
  id: string;
  sequence: number; // 1..6
  term: number; // 1..3
}

/** One row in the Report Cards table — an aggregated per-student result. */
export interface ReportRow {
  id: string;
  fullName: string;
  matricule: string | null;
  classId: string;
  className: string;
  average: number; // out of 20
  rank: number; // rank within the class (1 = top)
  total: number; // number of students in the class
  decision: Decision;
}

export interface ReportQuery {
  page: number;
  perPage: number;
  search?: string;
  classId?: string;
  sortBy?: keyof ReportRow;
  sortDir?: "asc" | "desc";
}

/** The Class + Subject + Exam a mark-entry session is scoped to. */
export interface EntrySelection {
  classId: string;
  subjectId: string;
  examId: string;
}

/** A student in the mark-entry roster, with any previously saved mark. */
export interface EntryStudent {
  id: string;
  fullName: string;
  matricule: string | null;
  mark: number | null;
}

export interface SaveMarksInput extends EntrySelection {
  marks: { studentId: string; mark: number }[];
}

// ---------------------------------------------------------------------------
// Report cards (Term / Sequence / Annual)
// ---------------------------------------------------------------------------

/**
 * The three report-card modes:
 * - `term`: aggregates a term's two sequences (Term = First/Second/Third → 1..3),
 * - `sequence`: a single exam sequence (1..6),
 * - `annual`: the full academic year (no term/sequence selector).
 */
export type ReportMode = "term" | "sequence" | "annual";

/** Filter metadata for the report cards screen (`GET /dashboard/reports`). */
export interface ReportIndex {
  academicYears: string[];
  currentAcademicYear: string;
  classes: ClassOption[];
}

/** Selection driving a preview / generate / download call. */
export interface ReportParams {
  term?: number; // 1..3 — term mode only
  sequence?: number; // 1..6 — sequence mode only
  classId?: string; // optional class filter (omitted → whole school)
}

/** Download variants also need the academic year (it's part of the URL). */
export interface ReportDownloadParams extends ReportParams {
  academicYear: string;
  studentId?: string; // present → single-student download
}

/** One student row in a report-card preview. */
export interface ReportPreviewStudent {
  id: string;
  fullName: string;
  matricule: string | null;
  className: string;
  /** Distinct subjects (term/sequence) or marks (annual) the student has so far. */
  subjectsCount: number;
  /** Expected subjects to be complete; `null` for annual (backend gives no total). */
  totalSubjects: number | null;
  /** True when the student is short of `totalSubjects` (or has no marks for annual). */
  missing: boolean;
}

/** Normalised preview payload shared by all three modes. */
export interface ReportPreview {
  students: ReportPreviewStudent[];
  totalSubjects: number | null;
  academicYear: string;
  term?: number;
  sequence?: number;
  /** Human-readable "missing marks" notices (populated by the sequence endpoint). */
  errors: string[];
}

/** Result of a generate call — the backend returns a JSON message to surface. */
export interface ReportGenerateResult {
  message: string;
}
