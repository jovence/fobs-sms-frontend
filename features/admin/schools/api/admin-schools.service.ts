import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { Paginated } from "@/types";
import type { AdminSchool, AdminSchoolQuery, SubscriptionTier } from "../types";
import { seedAdminSchools } from "../mock-data";

export interface AdminSchoolsService {
  list(query: AdminSchoolQuery): Promise<Paginated<AdminSchool>>;
  setTier(id: string, tier: SubscriptionTier): Promise<AdminSchool>;
  toggleDemo(id: string): Promise<AdminSchool>;
}

let cache: AdminSchool[] | null = null;
function db() {
  if (!cache) cache = mockStore.get<AdminSchool[]>("adminSchools", seedAdminSchools);
  return cache;
}
function commit(next: AdminSchool[]) {
  cache = next;
  mockStore.set("adminSchools", next);
}

const mock: AdminSchoolsService = {
  async list(query) {
    let rows = [...db()];
    const { search, subscription, sortBy, sortDir, page, perPage } = query;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q),
      );
    }
    if (subscription) rows = rows.filter((r) => r.subscription === subscription);
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
  async setTier(id, tier) {
    let updated: AdminSchool | undefined;
    commit(db().map((r) => (r.id === id ? (updated = { ...r, subscription: tier }) : r)));
    if (!updated) throw new Error("School not found");
    return withLatency(updated, 400);
  },
  async toggleDemo(id) {
    let updated: AdminSchool | undefined;
    commit(db().map((r) => (r.id === id ? (updated = { ...r, isDemo: !r.isDemo }) : r)));
    if (!updated) throw new Error("School not found");
    return withLatency(updated, 350);
  },
};

export const adminSchoolsService: AdminSchoolsService =
  API_MODE === "live" ? mock : mock;
