"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { referralsService } from "./api/referrals.service";
import type { ReferralQuery } from "./types";

export const referralKeys = {
  all: ["referrals"] as const,
  summary: () => ["referrals", "summary"] as const,
  list: (q: ReferralQuery) => ["referrals", "list", q] as const,
};

export function useReferralSummary() {
  return useQuery({
    queryKey: referralKeys.summary(),
    queryFn: () => referralsService.summary(),
  });
}

export function useReferralUsages(query: ReferralQuery) {
  return useQuery({
    queryKey: referralKeys.list(query),
    queryFn: () => referralsService.list(query),
    placeholderData: keepPreviousData,
  });
}
