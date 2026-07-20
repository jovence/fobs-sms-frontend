"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { teachersService } from "./api/teachers.service";
import type { ClassAssignmentInput, TeacherInput, TeacherQuery } from "./types";

export const teacherKeys = {
  all: (school: string) => ["school", school, "teachers"] as const,
  list: (school: string, q: TeacherQuery) =>
    ["school", school, "teachers", "list", q] as const,
  detail: (school: string, id: string) =>
    ["school", school, "teachers", "detail", id] as const,
  assignSubjects: (school: string, id: string) =>
    ["school", school, "teachers", "detail", id, "assign-subjects"] as const,
  assignClasses: (school: string, id: string) =>
    ["school", school, "teachers", "detail", id, "assign-classes"] as const,
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

export function useTeacher(id: string) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: teacherKeys.detail(school, id),
    queryFn: () => teachersService.get(id),
  });
}

export function useTeacherAssignSubjectsForm(id: string) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: teacherKeys.assignSubjects(school, id),
    queryFn: () => teachersService.assignSubjectsForm(id),
  });
}

export function useTeacherAssignClassesForm(id: string) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: teacherKeys.assignClasses(school, id),
    queryFn: () => teachersService.assignClassesForm(id),
  });
}

export function useAssignSubjects(id: string) {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (subjectIds: string[]) => teachersService.assignSubjects(id, subjectIds),
    // Subjects drive class options too, so refresh every teacher-scoped query.
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
  });
}

export function useRemoveTeacherSubject(id: string) {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (subjectId: string) => teachersService.removeSubject(id, subjectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
  });
}

export function useAssignClasses(id: string) {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (assignments: ClassAssignmentInput[]) =>
      teachersService.assignClasses(id, assignments),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
  });
}

export function useRemoveTeacherClass(id: string) {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (classId: string) => teachersService.removeClass(id, classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all(school) }),
  });
}
