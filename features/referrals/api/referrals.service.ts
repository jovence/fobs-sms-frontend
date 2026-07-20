import type { Paginated } from "@/types";
import type { ReferralQuery, ReferralSummary, ReferralUsage } from "../types";
import { httpReferralsService } from "./referrals.http";

/**
 * The referrals contract. Screens depend on this interface — never on how it's fulfilled.
 * Backed live by {@link httpReferralsService} (Laravel `/api/dashboard/referrals`,
 * owner-scoped to the active school). The referral business constants (discount/earning
 * per referral) come from the backend summary, not hardcoded here.
 */
export interface ReferralsService {
  summary(): Promise<ReferralSummary>;
  list(query: ReferralQuery): Promise<Paginated<ReferralUsage>>;
}

export const referralsService: ReferralsService = httpReferralsService;
