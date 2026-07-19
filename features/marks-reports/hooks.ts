"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { marksService } from "./api/marks.service";
import type { EntrySelection, ReportQuery, SaveMarksInput } from "./types";

export const marksKeys = {
  all: ["marks"] as const,
  reports: (q: ReportQuery) => ["marks", "reports", q] as const,
  roster: (s: EntrySelection) => ["marks", "roster", s] as const,
};

export function useReportRows(query: ReportQuery) {
  return useQuery({
    queryKey: marksKeys.reports(query),
    queryFn: () => marksService.listReportRows(query),
    placeholderData: keepPreviousData,
  });
}

export function useEntryRoster(selection: EntrySelection | null) {
  return useQuery({
    queryKey: marksKeys.roster(selection ?? { classId: "", subjectId: "", examId: "" }),
    queryFn: () => marksService.listEntryRoster(selection as EntrySelection),
    enabled: !!selection,
  });
}

export function useSaveMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveMarksInput) => marksService.saveMarks(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: marksKeys.all }),
    // Shows its own contextual save-error toast; opt out of the global one.
    meta: { suppressErrorToast: true },
  });
}

export function useGenerateReportCard() {
  return useMutation({
    mutationFn: (id: string) => marksService.generateReportCard(id),
  });
}

export function useGenerateAll() {
  return useMutation({
    mutationFn: (query: ReportQuery) => marksService.generateAll(query),
  });
}
