"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { billingService } from "./api/billing.service";
import type { InvoiceQuery, SubscriptionTier } from "./types";

export const billingKeys = {
  all: (school: string) => ["school", school, "billing"] as const,
  overview: (school: string) => ["school", school, "billing", "overview"] as const,
  invoices: (school: string, q: InvoiceQuery) =>
    ["school", school, "billing", "invoices", q] as const,
};

export function useBillingOverview() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: billingKeys.overview(school),
    queryFn: () => billingService.overview(),
  });
}

export function useInvoices(query: InvoiceQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: billingKeys.invoices(school, query),
    queryFn: () => billingService.invoices(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

export function useRequestUpgrade() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (tier: SubscriptionTier) => billingService.requestUpgrade(tier),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.all(school) }),
    // Upgrade dialog shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}
