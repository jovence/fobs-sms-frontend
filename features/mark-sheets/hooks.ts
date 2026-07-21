"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { markSheetsService } from "./api/mark-sheets.service";
import type { MarkSheetSelection } from "./types";

export const markSheetKeys = {
  all: (school: string) => ["school", school, "mark-sheets"] as const,
  options: (school: string) => ["school", school, "mark-sheets", "options"] as const,
};

/** Subjects / exams / classes for the mark-sheet picker (scoped to the active school). */
export function useMarkSheetOptions() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: markSheetKeys.options(school),
    queryFn: () => markSheetsService.getOptions(),
  });
}

/**
 * Preview the marks table for a selection. Modelled as a mutation because it is an
 * explicit "Preview" action: it exposes `data` (the resolved sheet) and `error`
 * (the 422 "No marks found…" empty case) without any set-state-in-effect. Opts out
 * of the global error toast — the empty case is shown inline in the preview area.
 */
export function useMarkSheetPreview() {
  return useMutation({
    mutationFn: (selection: MarkSheetSelection) => markSheetsService.preview(selection),
    meta: { suppressErrorToast: true },
  });
}

/** Generate + download the printable mark sheet (PDF, or ZIP when no class is chosen). */
export function useMarkSheetDownload() {
  return useMutation({
    mutationFn: (selection: MarkSheetSelection) => markSheetsService.download(selection),
    // Caller shows its own success/error toast; opt out of the global one.
    meta: { suppressErrorToast: true },
  });
}
