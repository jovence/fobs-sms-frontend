"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { billingService } from "./api/billing.service";
import type { InvoiceQuery, SubscriptionTier } from "./types";

export const billingKeys = {
  all: ["billing"] as const,
  overview: () => ["billing", "overview"] as const,
  invoices: (q: InvoiceQuery) => ["billing", "invoices", q] as const,
};

export function useBillingOverview() {
  return useQuery({
    queryKey: billingKeys.overview(),
    queryFn: () => billingService.overview(),
  });
}

export function useInvoices(query: InvoiceQuery) {
  return useQuery({
    queryKey: billingKeys.invoices(query),
    queryFn: () => billingService.invoices(query),
    placeholderData: keepPreviousData,
  });
}

export function useRequestUpgrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tier: SubscriptionTier) => billingService.requestUpgrade(tier),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.all }),
    // Upgrade dialog shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}
