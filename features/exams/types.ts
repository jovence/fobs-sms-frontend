export type Term = "First" | "Second" | "Third";

export interface Exam {
  id: string;
  name: string;
  term: Term;
  sequence: number; // 1-6
  academicYear: string; // e.g. "2025-2026"
  published: boolean;
  markEntryAllowed: boolean;
  createdAt: string;
}

export interface ExamInput {
  name: string;
  term: Term;
  sequence: number;
  published: boolean;
  markEntryAllowed: boolean;
}

export interface ExamQuery {
  page: number;
  perPage: number;
  search?: string;
  term?: Term;
  sortBy?: keyof Exam;
  sortDir?: "asc" | "desc";
}

/** Letter-grade tallies for the exam (Cameroon /20 bands: A≥16, B 14-16, C 12-14, D 10-12, E<10). */
export interface ExamGradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

/** One class row in the Class Performance table (camelCase of a `classesList` entry). */
export interface ExamClassPerformance {
  classId: string;
  className: string;
  studentsCount: number;
  totalMarks: number;
  averageMark: number;
  passed: number;
  failed: number;
  passRate: number;
}

/** Per-class progress for a single subject (camelCase of a subject's `class_breakdown` entry). */
export interface ExamSubjectClassBreakdown {
  classId: string;
  className: string;
  totalStudents: number;
  marksEntered: number;
  marksPending: number;
  completionRate: number;
  hasMarks: boolean;
}

/** One subject block in the Subject Submission Status list (camelCase of a `subjectStats` entry). */
export interface ExamSubjectStat {
  subjectId: string;
  subjectName: string;
  subjectCode: string | null;
  marksEntered: number;
  studentsAssessed: number;
  totalExpected: number;
  averageMark: number;
  highestMark: number | null;
  lowestMark: number | null;
  passRate: number;
  submitted: boolean;
  examDate: string | null;
  classBreakdown: ExamSubjectClassBreakdown[];
}

/**
 * The exam dashboard / analytics payload (camelCase mapping of `GetExamDashboardAction`).
 * `averageMark`/`highestMark`/`lowestMark` default to 0 when no marks are entered yet.
 */
export interface ExamDashboard {
  exam: Exam;
  totalSubjects: number;
  submittedSubjects: number;
  pendingSubjects: number;
  totalMarksEntered: number;
  totalExpectedMarks: number;
  completionRate: number;
  averageMark: number;
  highestMark: number;
  lowestMark: number;
  passRate: number;
  gradeDistribution: ExamGradeDistribution;
  classes: ExamClassPerformance[];
  subjects: ExamSubjectStat[];
}
