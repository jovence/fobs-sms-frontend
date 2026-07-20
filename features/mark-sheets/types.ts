/**
 * Mark sheets domain types. A mark sheet is the printable list of every student's
 * mark for one Subject + Exam (optionally narrowed to a single Class). Marks follow
 * the Cameroon / MINESEC convention (scored out of 20). The mirror of the backend
 * `MarkSheetController` (index / preview / generate / download).
 */

/** Marks are scored out of 20 (MINESEC); shown in the preview table header. */
export const MARK_MAX = 20;

/** Sentinel for the "All classes" option — Radix Select cannot hold an empty value. */
export const ALL_CLASSES = "__all__";

export interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

export interface ExamOption {
  id: string;
  name: string;
  term: number; // 1..3
}

export interface ClassOption {
  id: string;
  name: string;
}

/** Dropdown data for the mark-sheet picker (subjects + exams + classes). */
export interface MarkSheetOptions {
  subjects: SubjectOption[];
  exams: ExamOption[];
  classes: ClassOption[];
}

/** The Subject + Exam (+ optional Class) a mark sheet is scoped to. */
export interface MarkSheetSelection {
  subjectId: string;
  examId: string;
  /** Omitted / undefined means "all classes". */
  classId?: string;
}

/** One row of the previewed mark sheet — a single student's mark. */
export interface MarkSheetRow {
  id: string;
  studentName: string;
  matricule: string | null;
  className: string;
  mark: number | null;
}

/** The previewed mark sheet: what was selected plus the resolved marks table. */
export interface MarkSheetPreview {
  subject: { id: string; name: string; code: string };
  exam: { id: string; name: string };
  class: { id: string; name: string } | null;
  rows: MarkSheetRow[];
}
