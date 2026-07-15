import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { Paginated } from "@/types";
import type { ReferralQuery, ReferralSummary, ReferralUsage } from "../types";
import {
  DISCOUNT_PER_REFERRAL,
  EARNING_PER_REFERRAL,
  REFERRAL_CODE,
  seedReferralUsages,
} from "../mock-data";

export interface ReferralsService {
  summary(): Promise<ReferralSummary>;
  list(query: ReferralQuery): Promise<Paginated<ReferralUsage>>;
}

// ---- Mock implementation (persists to localStorage so it behaves like a backend) ----

let cache: ReferralUsage[] | null = null;
function db(): ReferralUsage[] {
  if (!cache) cache = mockStore.get<ReferralUsage[]>("referrals", seedReferralUsages);
  return cache;
}

const mockReferralsService: ReferralsService = {
  async summary() {
    const rows = db();
    const successful = rows.filter((r) => r.status === "Successful");
    const summary: ReferralSummary = {
      code: REFERRAL_CODE,
      totalEarnings: successful.reduce((sum, r) => sum + r.earnings, 0),
      successfulReferrals: successful.length,
      discountPerReferral: DISCOUNT_PER_REFERRAL,
      earningPerReferral: EARNING_PER_REFERRAL,
    };
    return withLatency(summary, 400);
  },

  async list(query) {
    let rows = [...db()];
    const { search, status, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.schoolName.toLowerCase().includes(q));
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
    const items = rows.slice(start, start + perPage);

    return withLatency(
      { items, page, perPage, total, totalPages: Math.ceil(total / perPage) || 1 },
      450,
    );
  },
};

export const referralsService: ReferralsService =
  API_MODE === "live" ? mockReferralsService : mockReferralsService;
