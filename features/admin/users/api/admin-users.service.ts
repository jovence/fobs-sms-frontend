import { pickService } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { Paginated } from "@/types";
import type { AdminUser, AdminUserQuery } from "../types";
import { seedAdminUsers } from "../mock-data";
import { httpAdminUsersService } from "./admin-users.http";

export interface AdminUsersService {
  list(query: AdminUserQuery): Promise<Paginated<AdminUser>>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

let cache: AdminUser[] | null = null;
function db() {
  if (!cache) cache = mockStore.get<AdminUser[]>("adminUsers", seedAdminUsers);
  return cache;
}
function commit(next: AdminUser[]) {
  cache = next;
  mockStore.set("adminUsers", next);
}

const mock: AdminUsersService = {
  async list(query) {
    let rows = [...db()];
    const { search, role, sortBy, sortDir, page, perPage } = query;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
    }
    if (role) rows = rows.filter((r) => r.role === role);
    if (sortBy) {
      const dir = sortDir === "desc" ? -1 : 1;
      rows.sort((a, b) => {
        const av = a[sortBy] ?? "";
        const bv = b[sortBy] ?? "";
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    const total = rows.length;
    const start = (page - 1) * perPage;
    return withLatency(
      { items: rows.slice(start, start + perPage), page, perPage, total, totalPages: Math.ceil(total / perPage) || 1 },
      450,
    );
  },
  async remove(id) {
    // Keep a row if it isn't the target, or if it's an admin (admins are protected).
    commit(db().filter((r) => r.id !== id || r.role === "admin"));
    return withLatency(undefined, 400);
  },
  async bulkRemove(ids) {
    const set = new Set(ids);
    commit(db().filter((r) => !set.has(r.id) || r.role === "admin"));
    return withLatency(undefined, 500);
  },
};

export const adminUsersService: AdminUsersService = pickService(
  mock,
  httpAdminUsersService,
);
