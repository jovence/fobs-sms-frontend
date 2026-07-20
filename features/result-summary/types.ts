/**
 * Result Summary — pick a Class + an Exam/Sequence and generate a landscape roster PDF of
 * every student's mark per subject. The index feeds two dropdowns; generate streams the PDF.
 */

/** A class option for the generator dropdown. */
export interface ResultSummaryClassOption {
  id: string;
  name: string;
}

/** An exam/sequence option; `label` bakes in sequence/term/year for an unambiguous choice. */
export interface ResultSummaryExamOption {
  id: string;
  name: string;
  term: string | null;
  academicYear: string | null;
  sequence: number | null;
  /** Display label, e.g. "End of Term Exam · Seq 1 · First · 2025-2026". */
  label: string;
}

/** The two option lists the generator page renders. */
export interface ResultSummaryOptions {
  classes: ResultSummaryClassOption[];
  exams: ResultSummaryExamOption[];
}

/** Body for the generate endpoint (mapped to snake_case `{ class_id, exam_id }` at the edge). */
export interface GenerateResultSummaryInput {
  classId: string;
  examId: string;
}

/**
 * Build the exam label from its parts, mirroring how the backend PDF header names a sequence
 * (name + sequence + term + academic year). Shared by the mock and live services so the label
 * a user picks in mock mode reads the same once the live API is wired.
 */
export function resultSummaryExamLabel(e: {
  name: string;
  sequence: number | null;
  term: string | null;
  academicYear: string | null;
}): string {
  const parts: string[] = [e.name];
  if (e.sequence != null) parts.push(`Seq ${e.sequence}`);
  if (e.term) parts.push(e.term);
  if (e.academicYear) parts.push(e.academicYear);
  return parts.join(" · ");
}
