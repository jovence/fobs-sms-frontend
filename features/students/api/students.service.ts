import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import type { Student, StudentInput, StudentQuery } from "../types";
import { mockClasses, seedStudents } from "../mock-data";

export interface StudentsService {
  list(query: StudentQuery): Promise<Paginated<Student>>;
  get(id: string): Promise<Student>;
  create(input: StudentInput): Promise<Student>;
  update(id: string, input: StudentInput): Promise<Student>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  updateStatus(id: string, status: Student["status"]): Promise<Student>;
}

// ---- Mock implementation (persists to localStorage so edits survive reloads) ----

function db(): Student[] {
  return mockStore.get<Student[]>(scopedKey("students"), isDemoSchool() ? seedStudents : []);
}
function commit(next: Student[]) {
  mockStore.set(scopedKey("students"), next);
}
function className(classId: string) {
  return mockClasses.find((c) => c.id === classId)?.name ?? "—";
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
};

export const studentsService: StudentsService =
  API_MODE === "live" ? mockStudentsService : mockStudentsService;
