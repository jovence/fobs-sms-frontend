"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { attendanceService } from "./api/attendance.service";
import type { AttendanceQuery, SaveSessionInput } from "./types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  sessions: (q: AttendanceQuery) => ["attendance", "sessions", q] as const,
  roster: (classId: string) => ["attendance", "roster", classId] as const,
};

export function useRoster(classId: string | undefined) {
  return useQuery({
    queryKey: attendanceKeys.roster(classId ?? ""),
    queryFn: () => attendanceService.getRoster(classId as string),
    enabled: !!classId,
  });
}

export function useSessions(query: AttendanceQuery) {
  return useQuery({
    queryKey: attendanceKeys.sessions(query),
    queryFn: () => attendanceService.listSessions(query),
    placeholderData: keepPreviousData,
  });
}

export function useSaveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveSessionInput) => attendanceService.saveSession(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
