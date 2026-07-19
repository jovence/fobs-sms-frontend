"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { teachersService } from "./api/teachers.service";
import type { TeacherInput, TeacherQuery } from "./types";

export const teacherKeys = {
  all: (school: string) => ["school", school, "teachers"] as const,
  list: (school: string, q: TeacherQuery) =>
    ["school", school, "teachers", "list", q] as const,
};

export function useTeachers(query: TeacherQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: teacherKeys.list(school, query),
    queryFn: () => teachersService.list(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

export function useApproveTeacher() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (id: string) => teachersService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TeacherInput }) =>
      teachersService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (id: string) => teachersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
  });
}

export function useBulkDeleteTeachers() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (ids: string[]) => teachersService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
  });
}
