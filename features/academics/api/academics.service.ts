import { pickService } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import type {
  ClassQuery,
  ClassStats,
  SchoolClass,
  SchoolClassInput,
  Subject,
  SubjectClassAssignment,
  SubjectInput,
  SubjectQuery,
  SubjectStats,
} from "../types";
import { currentAcademicYear } from "@/lib/format";
import { deriveSubjectLevel, seedClasses, seedSubjects } from "../mock-data";
import { httpClassesService, httpSubjectsService } from "./academics.http";

export interface ClassOption {
  id: string;
  name: string;
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

function paginate<T>(rows: T[], page: number, perPage: number): Paginated<T> {
  const total = rows.length;
  const start = (page - 1) * perPage;
  return {
    items: rows.slice(start, start + perPage),
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage) || 1,
  };
}

function sortRows<T>(rows: T[], sortBy?: keyof T, sortDir?: "asc" | "desc") {
  if (!sortBy) return rows;
  const dir = sortDir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortBy] ?? "";
    const bv = b[sortBy] ?? "";
    return av < bv ? -dir : av > bv ? dir : 0;
  });
}

// ---- Classes ----
function classDb() {
  return mockStore.get<SchoolClass[]>(scopedKey("classes"), isDemoSchool() ? seedClasses : []);
}
function classCommit(next: SchoolClass[]) {
  mockStore.set(scopedKey("classes"), next);
}

/** Synchronous class-name lookup for the active school (used to denormalize into students). */
export function classNameFor(id: string): string {
  return classDb().find((c) => c.id === id)?.name ?? "—";
}

const mockClassesService: ClassesService = {
  async list(query) {
    let rows = [...classDb()];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (query.level) rows = rows.filter((r) => r.level === query.level);
    rows = sortRows(rows, query.sortBy, query.sortDir);
    return withLatency(paginate(rows, query.page, query.perPage), 400);
  },
  async options() {
    return withLatency(
      classDb().map((c) => ({ id: c.id, name: c.name })),
      200,
    );
  },
  async stats() {
    const rows = classDb();
    return withLatency(
      {
        totalClasses: rows.length,
        upperCount: rows.filter((r) => r.level === "upper").length,
        lowerCount: rows.filter((r) => r.level === "lower").length,
        totalStudents: rows.reduce((sum, r) => sum + r.studentsCount, 0),
      },
      200,
    );
  },
  async create(input) {
    const cls: SchoolClass = {
      id: `cls_${Date.now().toString(36)}`,
      name: input.name.trim(),
      level: input.level,
      section: input.section,
      academicYear: currentAcademicYear(),
      classMaster: input.classMasterName?.trim() || null,
      classMasterId: input.classMasterId || null,
      studentsCount: 0,
      subjectsCount: 0,
      createdAt: new Date().toISOString(),
    };
    classCommit([cls, ...classDb()]);
    return withLatency(cls, 450);
  },
  async update(id, input) {
    let updated: SchoolClass | undefined;
    classCommit(
      classDb().map((r) =>
        r.id === id
          ? (updated = {
              ...r,
              name: input.name.trim(),
              level: input.level,
              section: input.section,
              classMaster: input.classMasterName?.trim() || null,
              classMasterId: input.classMasterId || null,
            })
          : r,
      ),
    );
    if (!updated) throw new Error("Class not found");
    return withLatency(updated, 450);
  },
  async remove(id) {
    classCommit(classDb().filter((r) => r.id !== id));
    return withLatency(undefined, 400);
  },
  async bulkRemove(ids) {
    const set = new Set(ids);
    classCommit(classDb().filter((r) => !set.has(r.id)));
    return withLatency(undefined, 450);
  },
};

// ---- Subjects ----
function subjectDb() {
  return mockStore.get<Subject[]>(scopedKey("subjects"), isDemoSchool() ? seedSubjects : []);
}
function subjectCommit(next: Subject[]) {
  mockStore.set(scopedKey("subjects"), next);
}

/** Synchronous subject-name lookup for the active school. */
export function subjectNameFor(id: string): string {
  return subjectDb().find((s) => s.id === id)?.name ?? "—";
}

function subjectStats(rows: Subject[]): SubjectStats {
  return {
    totalSubjects: rows.length,
    // Mirror the backend: "both"-series subjects count toward BOTH art and science.
    artCount: rows.filter((s) => s.series === "art" || s.series === "both").length,
    scienceCount: rows.filter((s) => s.series === "science" || s.series === "both").length,
  };
}

const mockSubjectsService: SubjectsService = {
  async list(query) {
    const all = subjectDb();
    let rows = [...all];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
      );
    }
    if (query.series) rows = rows.filter((r) => r.series === query.series);
    if (query.level) rows = rows.filter((r) => r.level === query.level);
    rows = sortRows(rows, query.sortBy, query.sortDir);
    // Stats are computed over the unfiltered catalog; the paginated total is filtered.
    return withLatency(
      { ...paginate(rows, query.page, query.perPage), stats: subjectStats(all) },
      400,
    );
  },
  async options() {
    return withLatency(
      subjectDb().map((s) => ({ id: s.id, name: s.name })),
      200,
    );
  },
  async getAssignments(id) {
    const subject = subjectDb().find((s) => s.id === id);
    return withLatency(
      (subject?.assignments ?? []).filter((a) => a.assigned),
      200,
    );
  },
  async create(input) {
    const assignments = input.classes.filter((c) => c.assigned);
    const assignedIds = assignments.map((a) => a.classId);
    const subject: Subject = {
      id: `sub_${Date.now().toString(36)}`,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      series: input.series,
      level: deriveSubjectLevel(assignedIds, classDb()),
      classesCount: assignments.length,
      createdAt: new Date().toISOString(),
      assignments,
    };
    subjectCommit([subject, ...subjectDb()]);
    return withLatency(subject, 450);
  },
  async update(id, input) {
    const assignments = input.classes.filter((c) => c.assigned);
    const assignedIds = assignments.map((a) => a.classId);
    let updated: Subject | undefined;
    subjectCommit(
      subjectDb().map((r) =>
        r.id === id
          ? (updated = {
              ...r,
              name: input.name.trim(),
              code: input.code.trim().toUpperCase(),
              series: input.series,
              level: deriveSubjectLevel(assignedIds, classDb()),
              classesCount: assignments.length,
              assignments,
            })
          : r,
      ),
    );
    if (!updated) throw new Error("Subject not found");
    return withLatency(updated, 450);
  },
  async remove(id) {
    subjectCommit(subjectDb().filter((r) => r.id !== id));
    return withLatency(undefined, 400);
  },
  async bulkRemove(ids) {
    const set = new Set(ids);
    subjectCommit(subjectDb().filter((r) => !set.has(r.id)));
    return withLatency(undefined, 450);
  },
};

export const classesService: ClassesService = pickService(
  mockClassesService,
  httpClassesService,
);
export const subjectsService: SubjectsService = pickService(
  mockSubjectsService,
  httpSubjectsService,
);
