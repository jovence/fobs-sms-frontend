"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminReferralsService } from "./api/admin-referrals.service";
import type { AdminReferralQuery } from "./types";

const keys = {
  all: ["admin-referrals"] as const,
  list: (q: AdminReferralQuery) => ["admin-referrals", "list", q] as const,
  stats: ["admin-referrals", "stats"] as const,
};

export function useReferrers(query: AdminReferralQuery) {
  return useQuery({
    queryKey: keys.list(query),
    queryFn: () => adminReferralsService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useReferralStats() {
  return useQuery({ queryKey: keys.stats, queryFn: () => adminReferralsService.stats() });
}

export function useToggleReferrer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminReferralsService.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteReferrer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminReferralsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useBulkDeleteReferrers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminReferralsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
