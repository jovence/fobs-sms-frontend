"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { studentsService } from "./api/students.service";
import type { Student, StudentInput, StudentQuery } from "./types";

export const studentKeys = {
  all: ["students"] as const,
  list: (q: StudentQuery) => ["students", "list", q] as const,
};

export function useStudents(query: StudentQuery) {
  return useQuery({
    queryKey: studentKeys.list(query),
    queryFn: () => studentsService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => studentsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StudentInput }) =>
      studentsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useBulkDeleteStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => studentsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useUpdateStudentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Student["status"] }) =>
      studentsService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}
