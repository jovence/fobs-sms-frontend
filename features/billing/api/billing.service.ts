import type { Paginated } from "@/types";
import type {
  BillingOverview,
  Invoice,
  InvoiceQuery,
  SubscriptionTier,
} from "../types";
import { httpBillingService } from "./billing.http";

export interface BillingService {
  overview(): Promise<BillingOverview>;
  invoices(query: InvoiceQuery): Promise<Paginated<Invoice>>;
  /** "Contact sales" upgrade flow — records interest, never charges a card. */
  requestUpgrade(tier: SubscriptionTier): Promise<{ tier: SubscriptionTier }>;
}

export const billingService: BillingService = httpBillingService;
