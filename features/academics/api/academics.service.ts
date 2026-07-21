import type { Paginated } from "@/types";
import type {
  ClassLevel,
  ClassQuery,
  ClassSection,
  ClassStats,
  SchoolClass,
  SchoolClassInput,
  Subject,
  SubjectClassAssignment,
  SubjectInput,
  SubjectQuery,
  SubjectStats,
} from "../types";
import { httpClassesService, httpSubjectsService } from "./academics.http";

export interface ClassOption {
  id: string;
  name: string;
  level?: ClassLevel;
  section?: ClassSection;
}

/** Paginated subjects plus the index summary counts (surfaced for the stat cards). */
export interface SubjectListResult extends Paginated<Subject> {
  stats: SubjectStats;
}

export interface ClassesService {
  list(query: ClassQuery): Promise<Paginated<SchoolClass>>;
  /** Lightweight {id,name} list for dropdowns, scoped to the active school. */
  options(): Promise<ClassOption[]>;
  /** Aggregate figures for the stat cards, scoped to the active school. */
  stats(): Promise<ClassStats>;
  create(input: SchoolClassInput): Promise<SchoolClass>;
  update(id: string, input: SchoolClassInput): Promise<SchoolClass>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

export interface SubjectsService {
  list(query: SubjectQuery): Promise<SubjectListResult>;
  /** Lightweight {id,name} list for dropdowns, scoped to the active school. */
  options(): Promise<ClassOption[]>;
  /** The assigned class rows for a subject (used to prefill the edit form). */
  getAssignments(id: string): Promise<SubjectClassAssignment[]>;
  create(input: SubjectInput): Promise<Subject>;
  update(id: string, input: SubjectInput): Promise<Subject>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

export const classesService: ClassesService = httpClassesService;
export const subjectsService: SubjectsService = httpSubjectsService;
