import { api } from "@/lib/api-client";
import { ApiError } from "@/types";
import type { ApiMeta, Paginated } from "@/types";
import type { AdminReferrer } from "../types";
import type { AdminReferralsService } from "./admin-referrals.service";

/**
 * Live implementation of {@link AdminReferralsService} against the Laravel backend
 * (`/api/dashboard/admin/referrals`, SuperAdmin-scoped). Maps the snake_case
 * `ReferralResource` payload onto the UI's camelCase {@link AdminReferrer} type.
 *
 * Backend surface is intentionally small: a paginated index (`search` + `per_page`)
 * and a single delete. Methods without a matching endpoint are noted below.
 */

/** Shape of the backend `ReferralResource` (snake_case, `id` numeric, money may be string). */
interface ReferralPayload {
  id: number | string;
  code: string;
  formatted_code: string | null;
  full_name: string;
  phone: string;
  sim_name: string | null;
  residence: string | null;
  referral_count: number | string | null;
  earnings: number | string | null;
  is_active: boolean;
  usages_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function mapReferrer(p: ReferralPayload): AdminReferrer {
  return {
    id: String(p.id),
    name: p.full_name,
    phone: p.phone,
    // The resource exposes both `code` (raw) and `formatted_code` (display); prefer the latter.
    code: p.formatted_code ?? p.code,
    residence: p.residence ?? "",
    referralCount: toNumber(p.referral_count),
    earnings: toNumber(p.earnings),
    isActive: p.is_active,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/** Map the backend's snake_case pagination `meta` onto the UI's {@link Paginated} envelope. */
function toPaginated(items: AdminReferrer[], meta: ApiMeta | null, fallbackPerPage: number): Paginated<AdminReferrer> {
  const perPage = meta?.per_page ?? fallbackPerPage;
  const total = meta?.total ?? items.length;
  return {
    items,
    page: meta?.current_page ?? 1,
    perPage,
    total,
    totalPages: meta?.last_page ?? (Math.ceil(total / perPage) || 1),
  };
}

export const httpAdminReferralsService: AdminReferralsService = {
  async list(query) {
    // Backend index supports `search`, `page` and `per_page` only.
    // NOTE: `status` (active/inactive) and `sortBy`/`sortDir` are not honoured server-side — ignored here.
    const params = new URLSearchParams({
      page: String(query.page),
      per_page: String(query.perPage),
    });
    if (query.search) params.set("search", query.search);
    const { data, meta } = await api.list<ReferralPayload>(`/dashboard/admin/referrals?${params.toString()}`);
    return toPaginated(data.map(mapReferrer), meta, query.perPage);
  },

  async stats() {
    // NOTE: no dedicated stats endpoint. Derived from a generous page of the index:
    // `referrers` comes from the accurate pagination `total`; earnings/referrals are summed
    // over the fetched rows (capped at per_page=1000, sufficient for current referrer counts).
    const { data, meta } = await api.list<ReferralPayload>("/dashboard/admin/referrals?per_page=1000");
    const rows = data.map(mapReferrer);
    return {
      referrers: meta?.total ?? rows.length,
      totalEarnings: rows.reduce((sum, r) => sum + r.earnings, 0),
      totalReferrals: rows.reduce((sum, r) => sum + r.referralCount, 0),
    };
  },

  async toggleActive() {
    // NOTE: no backend endpoint to toggle a referrer's active state.
    throw new ApiError("Not available yet.", "unknown", 501);
  },

  async remove(id) {
    await api.delete<null>(`/dashboard/admin/referrals/${id}`);
  },

  async bulkRemove(ids) {
    // NOTE: no bulk-delete endpoint; fan out to the single-delete route.
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/admin/referrals/${id}`)));
  },
};
