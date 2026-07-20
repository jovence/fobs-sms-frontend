export type ClassLevel = "lower" | "upper";
export type ClassSection = "english" | "french";
export type SubjectSeries = "science" | "art" | "both";
/** A subject's cycle level. Derived by the backend from its assigned classes' levels. */
export type SubjectLevel = "lower" | "upper" | "both";

export interface SchoolClass {
  id: string;
  name: string;
  level: ClassLevel;
  section: ClassSection;
  academicYear: string;
  /** Display name of the class master (teacher). */
  classMaster: string | null;
  /** Teacher id backing the class master, for prefilling the picker on edit. */
  classMasterId: string | null;
  studentsCount: number;
  subjectsCount: number;
  createdAt: string;
}

export interface SchoolClassInput {
  name: string;
  level: ClassLevel;
  section: ClassSection;
  /** Selected teacher id (backend `class_master_id`, used by the update path). */
  classMasterId?: string | null;
  /** Selected teacher name (backend `class_master`, used by the create path). */
  classMasterName?: string | null;
}

/** Aggregate figures for the classes stat cards (school-scoped, unfiltered). */
export interface ClassStats {
  totalClasses: number;
  upperCount: number;
  lowerCount: number;
  totalStudents: number;
}

/** One class row inside the subject form's class-assignment section. */
export interface SubjectClassAssignment {
  classId: string;
  assigned: boolean;
  coefficient: number;
  minWeeklyHours: number;
  teacherId: string | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  series: SubjectSeries;
  /** Cycle level derived from assigned classes; null until any class is assigned. */
  level: SubjectLevel | null;
  classesCount: number;
  createdAt: string;
  /** Only populated on the mock store / edit fetch; absent on the list endpoint. */
  assignments?: SubjectClassAssignment[];
}

export interface SubjectInput {
  name: string;
  code: string;
  series: SubjectSeries;
  /** Per-class coefficients/hours/teachers. The backend requires >=1 assigned entry. */
  classes: SubjectClassAssignment[];
}

/** Aggregate figures for the subjects stat cards (school-scoped, unfiltered). */
export interface SubjectStats {
  totalSubjects: number;
  artCount: number;
  scienceCount: number;
}

export interface ClassQuery {
  page: number;
  perPage: number;
  search?: string;
  level?: ClassLevel;
  sortBy?: keyof SchoolClass;
  sortDir?: "asc" | "desc";
}

export interface SubjectQuery {
  page: number;
  perPage: number;
  search?: string;
  series?: SubjectSeries;
  level?: ClassLevel;
  sortBy?: keyof Subject;
  sortDir?: "asc" | "desc";
}
