import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import type { Parent, ParentInput, ParentQuery } from "../types";
import { seedParents } from "../mock-data";

export interface ParentsService {
  list(query: ParentQuery): Promise<Paginated<Parent>>;
  create(input: ParentInput): Promise<Parent>;
  update(id: string, input: ParentInput): Promise<Parent>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

// ---- Mock implementation (persists to localStorage so edits survive reloads) ----

function db(): Parent[] {
  return mockStore.get<Parent[]>(scopedKey("parents"), isDemoSchool() ? seedParents : []);
}
function commit(next: Parent[]) {
  mockStore.set(scopedKey("parents"), next);
}

const mockParentsService: ParentsService = {
  async list(query) {
    let rows = [...db()];
    const { search, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.occupation.toLowerCase().includes(q),
      );
    }

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

  async create(input) {
    const parent: Parent = {
      id: `par_${Date.now().toString(36)}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      occupation: input.occupation.trim(),
      address: input.address.trim(),
      childrenCount: 0,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };
    commit([parent, ...db()]);
    return withLatency(parent, 500);
  },

  async update(id, input) {
    let updated: Parent | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = {
          ...r,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          occupation: input.occupation.trim(),
          address: input.address.trim(),
        };
        return updated;
      }),
    );
    if (!updated) throw new Error("Parent not found");
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

export const parentsService: ParentsService =
  API_MODE === "live" ? mockParentsService : mockParentsService;
