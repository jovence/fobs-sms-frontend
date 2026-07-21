"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { marksService } from "./api/marks.service";
import type {
  EntrySelection,
  ReportDownloadParams,
  ReportMode,
  ReportParams,
  SaveMarksInput,
} from "./types";

export const marksKeys = {
  all: (school: string) => ["school", school, "marks"] as const,
  roster: (school: string, s: EntrySelection) =>
    ["school", school, "marks", "roster", s] as const,
  reportIndex: (school: string) =>
    ["school", school, "marks", "report-index"] as const,
  reportPreview: (school: string, mode: ReportMode, params: ReportParams) =>
    ["school", school, "marks", "report-preview", mode, params] as const,
};

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

// ---- Report cards (Term / Sequence / Annual) ----

export function useReportIndex() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: marksKeys.reportIndex(school),
    queryFn: () => marksService.reportIndex(),
  });
}

/**
 * Preview the students in scope. Gated on `params` (null until the user hits
 * "Preview"), and school-scoped so a tenant switch can never surface another
 * school's preview.
 */
export function useReportPreview(mode: ReportMode, params: ReportParams | null) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: marksKeys.reportPreview(school, mode, params ?? {}),
    queryFn: () => marksService.previewReport(mode, params as ReportParams),
    enabled: !!params,
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

export function useGenerateReport(mode: ReportMode) {
  return useMutation({
    mutationFn: (params: ReportParams) => marksService.generateReport(mode, params),
    meta: { suppressErrorToast: true },
  });
}

export function useDownloadAllReports(mode: ReportMode) {
  return useMutation({
    mutationFn: (params: ReportDownloadParams) =>
      marksService.downloadAllReports(mode, params),
    meta: { suppressErrorToast: true },
  });
}

export function useDownloadStudentReport(mode: ReportMode) {
  return useMutation({
    mutationFn: (params: ReportDownloadParams) =>
      marksService.downloadStudentReport(mode, params),
    meta: { suppressErrorToast: true },
  });
}
