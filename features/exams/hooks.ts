"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { examsService } from "./api/exams.service";
import type { ExamInput, ExamQuery } from "./types";

export const examKeys = {
  all: ["exams"] as const,
  list: (q: ExamQuery) => ["exams", "list", q] as const,
};

export function useExams(query: ExamQuery) {
  return useQuery({
    queryKey: examKeys.list(query),
    queryFn: () => examsService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExamInput) => examsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all }),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExamInput }) =>
      examsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all }),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all }),
  });
}

export function useBulkDeleteExams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => examsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: examKeys.all }),
  });
}
