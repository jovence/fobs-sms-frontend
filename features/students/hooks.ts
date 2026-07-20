"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { studentsService } from "./api/students.service";
import type {
  Student,
  StudentImportConfirm,
  StudentImportInput,
  StudentInput,
  StudentQuery,
} from "./types";

export const studentKeys = {
  all: (school: string) => ["school", school, "students"] as const,
  list: (school: string, q: StudentQuery) =>
    ["school", school, "students", "list", q] as const,
  detail: (school: string, id: string) =>
    ["school", school, "students", "detail", id] as const,
  stats: (school: string) => ["school", school, "students", "stats"] as const,
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

export function useStudent(id: string) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: studentKeys.detail(school, id),
    queryFn: () => studentsService.get(id),
  });
}

export function useStudentStats() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: studentKeys.stats(school),
    queryFn: () => studentsService.stats(),
  });
}

/**
 * The two-step AI import: `parse` extracts a reviewable preview from a file, `confirm` persists
 * the reviewed rows. Confirm invalidates the whole students scope (list + stats) so the table
 * and stat cards refetch. Both suppress the global error toast — the dialog surfaces its own.
 */
export function useImportStudents() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  const parse = useMutation({
    mutationFn: (input: StudentImportInput) => studentsService.importParse(input),
    meta: { suppressErrorToast: true },
  });
  const confirm = useMutation({
    mutationFn: (input: StudentImportConfirm) => studentsService.importConfirm(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all(school) }),
    meta: { suppressErrorToast: true },
  });
  return { parse, confirm };
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
