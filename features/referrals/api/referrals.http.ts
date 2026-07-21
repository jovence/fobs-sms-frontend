import { api } from "@/lib/api-client";
import type { ApiMeta, Paginated } from "@/types";
import type { ReferralQuery, ReferralStatus, ReferralSummary, ReferralUsage } from "../types";
import type { ReferralsService } from "./referrals.service";

/**
 * Live implementation of {@link ReferralsService} against the Laravel backend
 * (`/api/dashboard/referrals` + `/api/dashboard/referrals/usages`, owner-scoped —
 * the active school is applied automatically via the api-client's `X-School-Id` header).
 * Maps the backend's snake_case payloads onto the UI's camelCase types.
 * See `features/schools/api/schools.http.ts` for the pattern.
 */

/** Shape of the backend referral summary payload (money may arrive as a string). */
interface SummaryPayload {
  code: string;
  total_earnings: number | string | null;
  successful_referrals: number | string | null;
  discount_per_referral: number | string | null;
  earning_per_referral: number | string | null;
}

/**
 * Shape of a backend referral-usage row (snake_case).
 * NOTE: assumed field names — `school_name` (the referred school), `status`, `earnings`, `date`.
 * `discount` is optional; when the resource omits it, the column renders 0 rather than a
 * fabricated constant.
 */
interface UsagePayload {
  id: number | string;
  school_name?: string | null;
  referred_school?: string | null;
  status: string | null;
  earnings: number | string | null;
  discount?: number | string | null;
  date: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toStatus(value: string | null | undefined): ReferralStatus {
  const v = (value ?? "").toLowerCase();
  if (v === "successful") return "Successful";
  if (v === "expired") return "Expired";
  return "Pending";
}

function mapSummary(p: SummaryPayload): ReferralSummary {
  return {
    code: p.code,
    totalEarnings: toNumber(p.total_earnings),
    successfulReferrals: toNumber(p.successful_referrals),
    discountPerReferral: toNumber(p.discount_per_referral),
    earningPerReferral: toNumber(p.earning_per_referral),
  };
}

function mapUsage(p: UsagePayload): ReferralUsage {
  return {
    id: String(p.id),
    schoolName: p.school_name ?? p.referred_school ?? "",
    date: p.date ?? new Date().toISOString(),
    discount: toNumber(p.discount),
    earnings: toNumber(p.earnings),
    status: toStatus(p.status),
  };
}

/** Map the backend's snake_case pagination `meta` onto the UI's {@link Paginated} envelope. */
function toPaginated(
  items: ReferralUsage[],
  meta: ApiMeta | null,
  fallbackPerPage: number,
): Paginated<ReferralUsage> {
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

export const httpReferralsService: ReferralsService = {
  async summary() {
    const payload = await api.get<SummaryPayload>("/dashboard/referrals");
    return mapSummary(payload);
  },

  async list(query) {
    const params = new URLSearchParams({
      page: String(query.page),
      per_page: String(query.perPage),
    });
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    // NOTE: server-side support for `status`/`sort` is assumed; unsupported params are ignored.
    if (query.sortBy) {
      params.set("sort_by", query.sortBy);
      params.set("sort_dir", query.sortDir ?? "asc");
    }
    const { data, meta } = await api.list<UsagePayload>(
      `/dashboard/referrals/usages?${params.toString()}`,
    );
    return toPaginated(data.map(mapUsage), meta, query.perPage);
  },
};
