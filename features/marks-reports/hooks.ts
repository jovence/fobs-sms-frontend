"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { marksService } from "./api/marks.service";
import type { EntrySelection, ReportQuery, SaveMarksInput } from "./types";

export const marksKeys = {
  all: (school: string) => ["school", school, "marks"] as const,
  reports: (school: string, q: ReportQuery) =>
    ["school", school, "marks", "reports", q] as const,
  roster: (school: string, s: EntrySelection) =>
    ["school", school, "marks", "roster", s] as const,
};

export function useReportRows(query: ReportQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: marksKeys.reports(school, query),
    queryFn: () => marksService.listReportRows(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

export function useEntryRoster(selection: EntrySelection | null) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: marksKeys.roster(
      school,
      selection ?? { classId: "", subjectId: "", examId: "" },
    ),
    queryFn: () => marksService.listEntryRoster(selection as EntrySelection),
    enabled: !!selection,
  });
}

export function useSaveMarks() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (input: SaveMarksInput) => marksService.saveMarks(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: marksKeys.all(school) }),
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
