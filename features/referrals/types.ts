export type ReferralStatus = "Successful" | "Pending" | "Expired";

export interface ReferralUsage {
  id: string;
  schoolName: string;
  date: string; // ISO
  discount: number; // XAF the referred school saved
  earnings: number; // XAF the referrer earned (0 unless successful)
  status: ReferralStatus;
}

export interface ReferralSummary {
  /** The owner's shareable referral code. */
  code: string;
  /** Total XAF earned across all successful referrals. */
  totalEarnings: number;
  /** Count of referrals that converted into a paid subscription. */
  successfulReferrals: number;
  /** Discount (XAF) the referred school receives. */
  discountPerReferral: number;
  /** Reward (XAF) the referrer earns per successful referral. */
  earningPerReferral: number;
}

export interface ReferralQuery {
  page: number;
  perPage: number;
  search?: string;
  status?: ReferralStatus;
  sortBy?: keyof ReferralUsage;
  sortDir?: "asc" | "desc";
}
