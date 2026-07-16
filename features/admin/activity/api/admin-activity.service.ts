import { pickService } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { Paginated } from "@/types";
import type { ActivityEntry, ActivityQuery } from "../types";
import { seedActivity } from "../mock-data";
import { httpAdminActivityService } from "./admin-activity.http";

export interface AdminActivityService {
  list(query: ActivityQuery): Promise<Paginated<ActivityEntry>>;
}

let cache: ActivityEntry[] | null = null;
function db() {
  if (!cache) cache = mockStore.get<ActivityEntry[]>("adminActivity", seedActivity);
  return cache;
}

const mock: AdminActivityService = {
  async list(query) {
    let rows = [...db()];
    const { search, type, sortBy, sortDir, page, perPage } = query;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.actor.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q),
      );
    }
    if (type) rows = rows.filter((r) => r.type === type);
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
      400,
    );
  },
};

export const adminActivityService: AdminActivityService = pickService(
  mock,
  httpAdminActivityService,
);
