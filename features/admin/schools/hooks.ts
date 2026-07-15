"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSchoolsService } from "./api/admin-schools.service";
import type { AdminSchoolQuery, SubscriptionTier } from "./types";

const keys = { all: ["admin-schools"] as const, list: (q: AdminSchoolQuery) => ["admin-schools", q] as const };

export function useAdminSchools(query: AdminSchoolQuery) {
  return useQuery({
    queryKey: keys.list(query),
    queryFn: () => adminSchoolsService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useSetTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: SubscriptionTier }) =>
      adminSchoolsService.setTier(id, tier),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useToggleDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminSchoolsService.toggleDemo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
