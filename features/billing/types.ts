import type { SubscriptionTier } from "@/types";

export type { SubscriptionTier };

export type InvoiceStatus = "paid" | "pending";

/** What an invoice line item is for — rendered via i18n so it stays bilingual. */
export type InvoiceKind = "subscription" | "smsTopup" | "setupFee";

export interface Invoice {
  id: string;
  number: string;
  date: string; // ISO
  kind: InvoiceKind;
  /** Present for subscription invoices — which tier was billed. */
  planTier: SubscriptionTier | null;
  /** Present for SMS top-ups — how many credits were purchased. */
  quantity: number | null;
  amount: number;
  status: InvoiceStatus;
}

/** A numeric quota, or "unlimited" for the Pro tier. */
export type LimitValue = number | "unlimited";

export interface PlanLimits {
  students: LimitValue;
  teachers: LimitValue;
  smsPerMonth: LimitValue;
}

export interface Plan {
  tier: SubscriptionTier;
  priceYearly: number;
  highlighted: boolean;
  limits: PlanLimits;
  /** Keys into billing.plans.featureList — translated at render time. */
  featureKeys: string[];
}

export interface CurrentSubscription {
  tier: SubscriptionTier;
  renewalDate: string; // ISO
  limits: PlanLimits;
}

export interface BillingOverview {
  current: CurrentSubscription;
  plans: Plan[];
}

export interface InvoiceQuery {
  page: number;
  perPage: number;
  search?: string;
  status?: InvoiceStatus;
  sortBy?: keyof Invoice;
  sortDir?: "asc" | "desc";
}
