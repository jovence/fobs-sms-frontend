"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { mockGceService } from "./api/mock-gce.service";

export const mockGceKeys = {
  all: (school: string) => ["school", school, "mock-gce"] as const,
  index: (school: string) => ["school", school, "mock-gce", "index"] as const,
};

/** School-scoped Mock GCE index (eligible classes + sequence-6 context). */
export function useMockGceIndex() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: mockGceKeys.index(school),
    queryFn: () => mockGceService.index(),
  });
}

/** Download the combined per-candidate slips PDF for a class. Own instance per card. */
export function useDownloadSlips() {
  return useMutation({
    mutationFn: ({ classId, className }: { classId: string; className: string }) =>
      mockGceService.downloadSlips(classId, className),
    // The card shows its own error toast; opt out of the global one.
    meta: { suppressErrorToast: true },
  });
}

/** Download the class-wide summary PDF for a class. Own instance per card. */
export function useDownloadSummary() {
  return useMutation({
    mutationFn: ({ classId, className }: { classId: string; className: string }) =>
      mockGceService.downloadSummary(classId, className),
    meta: { suppressErrorToast: true },
  });
}
