"use client";

import { useQuery } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { referralsService } from "./api/referrals.service";
import type { ReferralQuery } from "./types";

export const referralKeys = {
  all: (school: string) => ["school", school, "referrals"] as const,
  summary: (school: string) => ["school", school, "referrals", "summary"] as const,
  list: (school: string, q: ReferralQuery) =>
    ["school", school, "referrals", "list", q] as const,
};

export function useReferralSummary() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: referralKeys.summary(school),
    queryFn: () => referralsService.summary(),
  });
}

export function useReferralUsages(query: ReferralQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: referralKeys.list(school, query),
    queryFn: () => referralsService.list(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}
