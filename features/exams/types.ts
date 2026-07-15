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
