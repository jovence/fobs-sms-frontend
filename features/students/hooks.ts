"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { studentsService } from "./api/students.service";
import type { Student, StudentInput, StudentQuery } from "./types";

export const studentKeys = {
  all: (school: string) => ["school", school, "students"] as const,
  list: (school: string, q: StudentQuery) =>
    ["school", school, "students", "list", q] as const,
};

export function useStudents(query: StudentQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: studentKeys.list(school, query),
    queryFn: () => studentsService.list(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (input: StudentInput) => studentsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StudentInput }) =>
      studentsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (id: string) => studentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all(school) }),
  });
}

export function useBulkDeleteStudents() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (ids: string[]) => studentsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all(school) }),
  });
}

export function useUpdateStudentStatus() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Student["status"] }) =>
      studentsService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all(school) }),
  });
}
