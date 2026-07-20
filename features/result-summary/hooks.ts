"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { resultSummaryService } from "./api/result-summary.service";
import type { GenerateResultSummaryInput } from "./types";

export const resultSummaryKeys = {
  all: (school: string) => ["school", school, "result-summary"] as const,
  options: (school: string) => ["school", school, "result-summary", "options"] as const,
};

/** Classes + exams for the generator dropdowns (scoped to the active school). */
export function useResultSummaryOptions() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: resultSummaryKeys.options(school),
    queryFn: () => resultSummaryService.options(),
  });
}

/**
 * Generate + download the roster. The service triggers the browser download itself; this
 * mutation only tracks the in-flight state so the button can disable. The form surfaces the
 * 422 message (thrown as `ApiError`) via its own toast, so opt out of the global one.
 */
export function useGenerateResultSummary() {
  return useMutation({
    mutationFn: (input: GenerateResultSummaryInput) => resultSummaryService.generate(input),
    meta: { suppressErrorToast: true },
  });
}
