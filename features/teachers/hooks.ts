"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { teachersService } from "./api/teachers.service";
import type { TeacherInput, TeacherQuery } from "./types";

export const teacherKeys = {
  all: ["teachers"] as const,
  list: (q: TeacherQuery) => ["teachers", "list", q] as const,
};

export function useTeachers(query: TeacherQuery) {
  return useQuery({
    queryKey: teacherKeys.list(query),
    queryFn: () => teachersService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useApproveTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teachersService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TeacherInput }) =>
      teachersService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teachersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useBulkDeleteTeachers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => teachersService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}
