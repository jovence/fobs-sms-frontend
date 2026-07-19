"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { classesService, subjectsService } from "./api/academics.service";
import type { ClassQuery, SchoolClassInput, SubjectInput, SubjectQuery } from "./types";

const classKeys = {
  all: (school: string) => ["school", school, "classes"] as const,
  list: (school: string, q: ClassQuery) => ["school", school, "classes", q] as const,
  options: (school: string) => ["school", school, "classes", "options"] as const,
};
const subjectKeys = {
  all: (school: string) => ["school", school, "subjects"] as const,
  list: (school: string, q: SubjectQuery) => ["school", school, "subjects", q] as const,
  options: (school: string) => ["school", school, "subjects", "options"] as const,
};

export function useClasses(query: ClassQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: classKeys.list(school, query),
    queryFn: () => classesService.list(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

/** {id,name} class list for dropdowns/filters (scoped to the active school). */
export function useClassOptions() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: classKeys.options(school),
    queryFn: () => classesService.options(),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (input: SchoolClassInput) => classesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}
export function useUpdateClass() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SchoolClassInput }) =>
      classesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}
export function useDeleteClass() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (id: string) => classesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all(school) }),
  });
}
export function useBulkDeleteClasses() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (ids: string[]) => classesService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all(school) }),
  });
}

export function useSubjects(query: SubjectQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: subjectKeys.list(school, query),
    queryFn: () => subjectsService.list(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

/** {id,name} subject list for dropdowns/filters (scoped to the active school). */
export function useSubjectOptions() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: subjectKeys.options(school),
    queryFn: () => subjectsService.options(),
  });
}
export function useCreateSubject() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (input: SubjectInput) => subjectsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}
export function useUpdateSubject() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SubjectInput }) =>
      subjectsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}
export function useDeleteSubject() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (id: string) => subjectsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all(school) }),
  });
}
export function useBulkDeleteSubjects() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (ids: string[]) => subjectsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all(school) }),
  });
}
