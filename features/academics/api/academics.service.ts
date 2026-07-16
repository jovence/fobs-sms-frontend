import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import type {
  ClassQuery,
  SchoolClass,
  SchoolClassInput,
  Subject,
  SubjectInput,
  SubjectQuery,
} from "../types";
import { currentAcademicYear } from "@/lib/format";
import { seedClasses, seedSubjects } from "../mock-data";

export interface ClassOption {
  id: string;
  name: string;
}

export interface ClassesService {
  list(query: ClassQuery): Promise<Paginated<SchoolClass>>;
  /** Lightweight {id,name} list for dropdowns, scoped to the active school. */
  options(): Promise<ClassOption[]>;
  create(input: SchoolClassInput): Promise<SchoolClass>;
  update(id: string, input: SchoolClassInput): Promise<SchoolClass>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

export interface SubjectsService {
  list(query: SubjectQuery): Promise<Paginated<Subject>>;
  /** Lightweight {id,name} list for dropdowns, scoped to the active school. */
  options(): Promise<ClassOption[]>;
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
  async create(input) {
    const cls: SchoolClass = {
      id: `cls_${Date.now().toString(36)}`,
      name: input.name.trim(),
      level: input.level,
      section: input.section,
      academicYear: currentAcademicYear(),
      classMaster: input.classMaster?.trim() || null,
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
          ? (updated = { ...r, ...input, classMaster: input.classMaster?.trim() || null })
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

const mockSubjectsService: SubjectsService = {
  async list(query) {
    let rows = [...subjectDb()];
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
      );
    }
    if (query.series) rows = rows.filter((r) => r.series === query.series);
    rows = sortRows(rows, query.sortBy, query.sortDir);
    return withLatency(paginate(rows, query.page, query.perPage), 400);
  },
  async options() {
    return withLatency(
      subjectDb().map((s) => ({ id: s.id, name: s.name })),
      200,
    );
  },
  async create(input) {
    const subject: Subject = {
      id: `sub_${Date.now().toString(36)}`,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      series: input.series,
      classesCount: 0,
      createdAt: new Date().toISOString(),
    };
    subjectCommit([subject, ...subjectDb()]);
    return withLatency(subject, 450);
  },
  async update(id, input) {
    let updated: Subject | undefined;
    subjectCommit(
      subjectDb().map((r) =>
        r.id === id
          ? (updated = { ...r, ...input, code: input.code.trim().toUpperCase() })
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

export const classesService: ClassesService =
  API_MODE === "live" ? mockClassesService : mockClassesService;
export const subjectsService: SubjectsService =
  API_MODE === "live" ? mockSubjectsService : mockSubjectsService;
