"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { examsService } from "./api/exams.service";
import type { ExamInput, ExamQuery } from "./types";

export const examKeys = {
  all: (school: string) => ["school", school, "exams"] as const,
  list: (school: string, q: ExamQuery) => ["school", school, "exams", "list", q] as const,
  options: (school: string) => ["school", school, "exams", "options"] as const,
};

export function useExams(query: ExamQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: examKeys.list(school, query),
    queryFn: () => examsService.list(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

/** {id,name} exam list for dropdowns (scoped to the active school). */
export function useExamOptions() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: examKeys.options(school),
    queryFn: () => examsService.options(),
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (input: ExamInput) => examsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExamInput }) =>
      examsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (id: string) => examsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all(school) }),
  });
}

export function useBulkDeleteExams() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (ids: string[]) => examsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all(school) }),
  });
}
