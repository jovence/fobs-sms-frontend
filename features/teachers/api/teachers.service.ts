import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import type { Teacher, TeacherInput, TeacherQuery } from "../types";
import { seedTeachers } from "../mock-data";

export interface TeachersService {
  list(query: TeacherQuery): Promise<Paginated<Teacher>>;
  approve(id: string): Promise<Teacher>;
  update(id: string, input: TeacherInput): Promise<Teacher>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

function db(): Teacher[] {
  return mockStore.get<Teacher[]>(scopedKey("teachers"), isDemoSchool() ? seedTeachers : []);
}
function commit(next: Teacher[]) {
  mockStore.set(scopedKey("teachers"), next);
}

const mockTeachersService: TeachersService = {
  async list(query) {
    let rows = [...db()];
    const { search, status, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.specialization.toLowerCase().includes(q),
      );
    }
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
    return withLatency(
      {
        items: rows.slice(start, start + perPage),
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage) || 1,
      },
      450,
    );
  },

  async approve(id) {
    let updated: Teacher | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, status: "active" };
        return updated;
      }),
    );
    if (!updated) throw new Error("Teacher not found");
    return withLatency(updated, 400);
  },

  async update(id, input) {
    let updated: Teacher | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...input };
        return updated;
      }),
    );
    if (!updated) throw new Error("Teacher not found");
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

export const teachersService: TeachersService =
  API_MODE === "live" ? mockTeachersService : mockTeachersService;
