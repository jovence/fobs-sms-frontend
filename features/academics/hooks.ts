"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { classesService, subjectsService } from "./api/academics.service";
import type {
  ClassQuery,
  SchoolClassInput,
  SubjectInput,
  SubjectQuery,
} from "./types";

const classKeys = { all: ["classes"] as const, list: (q: ClassQuery) => ["classes", q] as const };
const subjectKeys = { all: ["subjects"] as const, list: (q: SubjectQuery) => ["subjects", q] as const };

export function useClasses(query: ClassQuery) {
  return useQuery({
    queryKey: classKeys.list(query),
    queryFn: () => classesService.list(query),
    placeholderData: keepPreviousData,
  });
}

/** {id,name} class list for dropdowns/filters (scoped to the active school). */
export function useClassOptions() {
  return useQuery({
    queryKey: ["classes", "options"],
    queryFn: () => classesService.options(),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SchoolClassInput) => classesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}
export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SchoolClassInput }) =>
      classesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}
export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}
export function useBulkDeleteClasses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => classesService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useSubjects(query: SubjectQuery) {
  return useQuery({
    queryKey: subjectKeys.list(query),
    queryFn: () => subjectsService.list(query),
    placeholderData: keepPreviousData,
  });
}

/** {id,name} subject list for dropdowns/filters (scoped to the active school). */
export function useSubjectOptions() {
  return useQuery({
    queryKey: ["subjects", "options"],
    queryFn: () => subjectsService.options(),
  });
}
export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectInput) => subjectsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all }),
  });
}
export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SubjectInput }) =>
      subjectsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all }),
  });
}
export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all }),
  });
}
export function useBulkDeleteSubjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => subjectsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all }),
  });
}
