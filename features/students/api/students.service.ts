import { pickService } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import { classNameFor } from "@/features/academics/api/academics.service";
import type {
  ParsedImportStudent,
  Student,
  StudentDetail,
  StudentImportConfirm,
  StudentImportInput,
  StudentImportPreview,
  StudentInput,
  StudentQuery,
  StudentStats,
} from "../types";
import { seedStudents } from "../mock-data";
import { httpStudentsService } from "./students.http";

export interface StudentsService {
  list(query: StudentQuery): Promise<Paginated<Student>>;
  get(id: string): Promise<StudentDetail>;
  stats(): Promise<StudentStats>;
  create(input: StudentInput): Promise<Student>;
  update(id: string, input: StudentInput): Promise<Student>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  updateStatus(id: string, status: Student["status"]): Promise<Student>;
  /** Parse a class-list file into a reviewable preview (Gemini on the live backend). */
  importParse(input: StudentImportInput): Promise<StudentImportPreview>;
  /** Persist the reviewed, extracted students into the target class. */
  importConfirm(input: StudentImportConfirm): Promise<void>;
}

// ---- Mock implementation (persists to localStorage so edits survive reloads) ----

function db(): Student[] {
  return mockStore.get<Student[]>(scopedKey("students"), isDemoSchool() ? seedStudents : []);
}
function commit(next: Student[]) {
  mockStore.set(scopedKey("students"), next);
}
function className(classId: string) {
  return classNameFor(classId);
}

const mockStudentsService: StudentsService = {
  async list(query) {
    let rows = [...db()];
    const { search, classId, status, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          (r.matricule ?? "").toLowerCase().includes(q),
      );
    }
    if (classId) rows = rows.filter((r) => r.classId === classId);
    if (status) rows = rows.filter((r) => r.status === status);

    if (sortBy) {
      const dir = sortDir === "desc" ? -1 : 1;
      rows.sort((a, b) => {
        const av = a[sortBy] ?? "";
        const bv = b[sortBy] ?? "";
        return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
      });
    }

    const total = rows.length;
    const start = (page - 1) * perPage;
    const items = rows.slice(start, start + perPage);

    return withLatency(
      { items, page, perPage, total, totalPages: Math.ceil(total / perPage) || 1 },
      450,
    );
  },

  async get(id) {
    const found = db().find((r) => r.id === id);
    if (!found) throw new Error("Student not found");
    return withLatency(found, 250);
  },

  async stats() {
    const rows = db();
    const stats: StudentStats = {
      total: rows.length,
      active: rows.filter((r) => r.status === "Approved").length,
      pending: rows.filter((r) => r.status === "Pending").length,
      male: rows.filter((r) => r.gender === "Male").length,
      female: rows.filter((r) => r.gender === "Female").length,
    };
    return withLatency(stats, 300);
  },

  async create(input) {
    const student: Student = {
      id: `stu_${Date.now().toString(36)}`,
      matricule: input.matricule?.trim() || null,
      fullName: input.fullName.trim(),
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      placeOfBirth: input.placeOfBirth.trim(),
      classId: input.classId,
      className: className(input.classId),
      status: input.status ?? "Pending",
      guardianName: input.guardianName?.trim() || null,
      photoUrl: null,
      isRepeater: input.isRepeater ?? false,
      createdAt: new Date().toISOString(),
    };
    commit([student, ...db()]);
    return withLatency(student, 500);
  },

  async update(id, input) {
    let updated: Student | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = {
          ...r,
          ...input,
          matricule: input.matricule?.trim() || null,
          className: className(input.classId),
          guardianName: input.guardianName?.trim() || null,
          isRepeater: input.isRepeater ?? r.isRepeater,
        };
        return updated;
      }),
    );
    if (!updated) throw new Error("Student not found");
    return withLatency(updated, 500);
  },

  async remove(id) {
    commit(db().filter((r) => r.id !== id));
    return withLatency(undefined, 400);
  },

  async bulkRemove(ids) {
    const set = new Set(ids);
    commit(db().filter((r) => !set.has(r.id)));
    return withLatency(undefined, 500);
  },

  async updateStatus(id, status) {
    let updated: Student | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, status };
        return updated;
      }),
    );
    if (!updated) throw new Error("Student not found");
    return withLatency(updated, 350);
  },

  async importParse({ file, classId }) {
    // Synthesize a preview from the uploaded file. We can read text-like files directly;
    // for binaries (images/PDF) that yield no usable text we fall back to a small sample so
    // the parse → preview → confirm flow stays demoable in mock mode.
    const parsed = parseImportText(await readFileText(file), className(classId));
    const students = parsed.length ? parsed : sampleImport(className(classId));
    return withLatency({ students, classId }, 900);
  },

  async importConfirm({ students, classId }) {
    const now = Date.now();
    const created: Student[] = students.map((s, i) => ({
      id: `stu_${(now + i).toString(36)}`,
      matricule: s.matricule?.trim() || null,
      fullName: s.fullName.trim(),
      gender: s.gender,
      dateOfBirth: s.dateOfBirth,
      placeOfBirth: s.placeOfBirth,
      classId,
      className: className(classId),
      // The backend marks imported students as Approved (see StudentService::storeImportedStudents).
      status: "Approved",
      guardianName: null,
      photoUrl: null,
      isRepeater: false,
      createdAt: new Date().toISOString(),
    }));
    commit([...created, ...db()]);
    return withLatency(undefined, 700);
  },
};

/** Best-effort read of a file as text; binaries simply yield an empty/garbled string. */
async function readFileText(file: File): Promise<string> {
  try {
    return await file.text();
  } catch {
    return "";
  }
}

/**
 * Parse comma/tab-separated lines into preview rows: `full name, matricule, gender, dob, place`.
 * Only the name is required; the rest fall back to sensible defaults (mirroring the backend
 * prompt's defaults).
 */
function parseImportText(text: string, classLabel: string): ParsedImportStudent[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [fullName, matricule, gender, dob, place] = line.split(/[,;\t]/).map((c) => c.trim());
      if (!fullName) return null;
      return {
        matricule: matricule || null,
        fullName,
        dateOfBirth: dob || "2000-01-01",
        placeOfBirth: place || "Yaoundé",
        gender: (gender ?? "").toLowerCase() === "female" ? "Female" : "Male",
        className: classLabel || null,
      } satisfies ParsedImportStudent;
    })
    .filter((s): s is ParsedImportStudent => s !== null)
    .slice(0, 50);
}

/** A tiny deterministic sample used when a file yields no parseable text. */
function sampleImport(classLabel: string): ParsedImportStudent[] {
  return [
    { matricule: "24S1042", fullName: "Awa Nkeng", dateOfBirth: "2011-03-14", placeOfBirth: "Bamenda", gender: "Female", className: classLabel || null },
    { matricule: "24S1043", fullName: "Bih Tanyi", dateOfBirth: "2010-09-02", placeOfBirth: "Buea", gender: "Female", className: classLabel || null },
    { matricule: null, fullName: "Che Fru", dateOfBirth: "2011-01-20", placeOfBirth: "Douala", gender: "Male", className: classLabel || null },
  ];
}

export const studentsService: StudentsService = pickService(
  mockStudentsService,
  httpStudentsService,
);
