export interface AdminReferrer {
  id: string;
  name: string;
  phone: string;
  code: string;
  residence: string;
  referralCount: number;
  earnings: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReferralStats {
  referrers: number;
  totalEarnings: number;
  totalReferrals: number;
}

export interface AdminReferralQuery {
  page: number;
  perPage: number;
  search?: string;
  status?: "active" | "inactive";
  sortBy?: keyof AdminReferrer;
  sortDir?: "asc" | "desc";
}
