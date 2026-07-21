/**
 * Mock GCE — Cameroon GCE-style mock examination for the 6th sequence.
 *
 * Eligible classes are Form 5 (Ordinary Level) and Upper Sixth (Advanced Level).
 * The 6th-sequence marks /20 are converted to GCE letter grades; this module only
 * surfaces the per-class roster tallies and the two PDF download actions.
 */

/** 'O' = Ordinary Level (Form 5), 'A' = Advanced Level (Upper Sixth). */
export type GceLevel = "O" | "A";

/** One GCE-eligible class row shown as a card on the Mock GCE page. */
export interface GceClass {
  id: string;
  name: string;
  level: GceLevel;
  /** Total candidates in the class (backend `student_count`). */
  candidates: number;
  /** Candidates with at least one sequence-6 mark (backend `students_marked`). */
  studentsMarked: number;
  /** Total sequence-6 marks recorded for the class (backend `marks_count`). */
  marksCount: number;
  /** Marks coverage %: round(studentsMarked / candidates * 100), 0 when no candidates. */
  coverage: number;
}

/** The Mock GCE landing payload: eligible classes for the active school + context. */
export interface MockGceIndex {
  academicYear: string;
  /** False when no 6th-sequence exam exists for the year (drives the warning banner). */
  hasSequenceSixExam: boolean;
  classes: GceClass[];
}

/**
 * Level-aware pass rules (mirrors backend App\Helpers\GceMockHelper):
 *  - O-Level: passes are A, B, C; certificate at >= 4 passes; points A=3, B=2, C=1.
 *  - A-Level: passes are A..E;    certificate at >= 2 passes; points A=5, B=4, C=3, D=2, E=1.
 */
export const GCE_PASS_RULES: Record<
  GceLevel,
  { passGrades: string[]; threshold: number; points: Record<string, number> }
> = {
  O: { passGrades: ["A", "B", "C"], threshold: 4, points: { A: 3, B: 2, C: 1 } },
  A: {
    passGrades: ["A", "B", "C", "D", "E"],
    threshold: 2,
    points: { A: 5, B: 4, C: 3, D: 2, E: 1 },
  },
};

/** Coverage helper shared by the mock + live mappers. */
export function coverageOf(studentsMarked: number, candidates: number): number {
  if (candidates <= 0) return 0;
  return Math.min(100, Math.round((studentsMarked / candidates) * 100));
}
