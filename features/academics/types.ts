export type ClassLevel = "lower" | "upper";
export type ClassSection = "english" | "french";
export type SubjectSeries = "science" | "art" | "both";

export interface SchoolClass {
  id: string;
  name: string;
  level: ClassLevel;
  section: ClassSection;
  academicYear: string;
  classMaster: string | null;
  studentsCount: number;
  subjectsCount: number;
  createdAt: string;
}

export interface SchoolClassInput {
  name: string;
  level: ClassLevel;
  section: ClassSection;
  classMaster?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  series: SubjectSeries;
  classesCount: number;
  createdAt: string;
}

export interface SubjectInput {
  name: string;
  code: string;
  series: SubjectSeries;
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
  sortBy?: keyof Subject;
  sortDir?: "asc" | "desc";
}
