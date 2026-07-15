import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { Paginated } from "@/types";
import type { AdminReferralQuery, AdminReferrer, ReferralStats } from "../types";
import { seedReferrers } from "../mock-data";

export interface AdminReferralsService {
  list(query: AdminReferralQuery): Promise<Paginated<AdminReferrer>>;
  stats(): Promise<ReferralStats>;
  toggleActive(id: string): Promise<AdminReferrer>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

let cache: AdminReferrer[] | null = null;
function db() {
  if (!cache) cache = mockStore.get<AdminReferrer[]>("adminReferrals", seedReferrers);
  return cache;
}
function commit(next: AdminReferrer[]) {
  cache = next;
  mockStore.set("adminReferrals", next);
}

const mock: AdminReferralsService = {
  async list(query) {
    let rows = [...db()];
    const { search, status, sortBy, sortDir, page, perPage } = query;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.phone.includes(q));
    }
    if (status) rows = rows.filter((r) => (status === "active" ? r.isActive : !r.isActive));
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
  async stats() {
    const rows = db();
    return withLatency(
      {
        referrers: rows.length,
        totalEarnings: rows.reduce((s, r) => s + r.earnings, 0),
        totalReferrals: rows.reduce((s, r) => s + r.referralCount, 0),
      },
      300,
    );
  },
  async toggleActive(id) {
    let updated: AdminReferrer | undefined;
    commit(db().map((r) => (r.id === id ? (updated = { ...r, isActive: !r.isActive }) : r)));
    if (!updated) throw new Error("Referrer not found");
    return withLatency(updated, 350);
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

export const adminReferralsService: AdminReferralsService =
  API_MODE === "live" ? mock : mock;
