import type { Paginated } from "@/types";
import type { AdminReferralQuery, AdminReferrer, ReferralStats } from "../types";
import { httpAdminReferralsService } from "./admin-referrals.http";

export interface AdminReferralsService {
  list(query: AdminReferralQuery): Promise<Paginated<AdminReferrer>>;
  stats(): Promise<ReferralStats>;
  toggleActive(id: string): Promise<AdminReferrer>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

export const adminReferralsService: AdminReferralsService = httpAdminReferralsService;
