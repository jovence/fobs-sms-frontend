"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { attendanceService } from "./api/attendance.service";
import type { AttendanceQuery, SaveSessionInput } from "./types";

export const attendanceKeys = {
  all: (school: string) => ["school", school, "attendance"] as const,
  sessions: (school: string, q: AttendanceQuery) =>
    ["school", school, "attendance", "sessions", q] as const,
  roster: (school: string, classId: string) =>
    ["school", school, "attendance", "roster", classId] as const,
};

export function useRoster(classId: string | undefined) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: attendanceKeys.roster(school, classId ?? ""),
    queryFn: () => attendanceService.getRoster(classId as string),
    enabled: !!classId,
  });
}

export function useSessions(query: AttendanceQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: attendanceKeys.sessions(school, query),
    queryFn: () => attendanceService.listSessions(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

export function useSaveSession() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (input: SaveSessionInput) => attendanceService.saveSession(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.all(school) }),
    // Shows its own contextual save-error toast; opt out of the global one.
    meta: { suppressErrorToast: true },
  });
}
