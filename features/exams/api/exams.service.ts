import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { currentAcademicYear } from "@/lib/format";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import type { Exam, ExamInput, ExamQuery } from "../types";
import { seedExams } from "../mock-data";

export interface ExamsService {
  list(query: ExamQuery): Promise<Paginated<Exam>>;
  /** Lightweight {id,name} list for dropdowns, scoped to the active school. */
  options(): Promise<Array<{ id: string; name: string }>>;
  get(id: string): Promise<Exam>;
  create(input: ExamInput): Promise<Exam>;
  update(id: string, input: ExamInput): Promise<Exam>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

// ---- Mock implementation (persists to localStorage so edits survive reloads) ----

function db(): Exam[] {
  return mockStore.get<Exam[]>(scopedKey("exams"), isDemoSchool() ? seedExams : []);
}
function commit(next: Exam[]) {
  mockStore.set(scopedKey("exams"), next);
}

const mockExamsService: ExamsService = {
  async list(query) {
    let rows = [...db()];
    const { search, term, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.academicYear.toLowerCase().includes(q),
      );
    }
    if (term) rows = rows.filter((r) => r.term === term);

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

  async options() {
    return withLatency(
      db().map((e) => ({ id: e.id, name: e.name })),
      200,
    );
  },

  async get(id) {
    const found = db().find((r) => r.id === id);
    if (!found) throw new Error("Exam not found");
    return withLatency(found, 250);
  },

  async create(input) {
    const exam: Exam = {
      id: `exm_${Date.now().toString(36)}`,
      name: input.name.trim(),
      term: input.term,
      sequence: input.sequence,
      academicYear: currentAcademicYear(),
      published: input.published,
      markEntryAllowed: input.markEntryAllowed,
      createdAt: new Date().toISOString(),
    };
    commit([exam, ...db()]);
    return withLatency(exam, 500);
  },

  async update(id, input) {
    let updated: Exam | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = {
          ...r,
          name: input.name.trim(),
          term: input.term,
          sequence: input.sequence,
          published: input.published,
          markEntryAllowed: input.markEntryAllowed,
        };
        return updated;
      }),
    );
    if (!updated) throw new Error("Exam not found");
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
};

export const examsService: ExamsService =
  API_MODE === "live" ? mockExamsService : mockExamsService;
