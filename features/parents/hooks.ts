"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { parentsService } from "./api/parents.service";
import type { ParentInput, ParentQuery } from "./types";

export const parentKeys = {
  all: (school: string) => ["school", school, "parents"] as const,
  list: (school: string, q: ParentQuery) =>
    ["school", school, "parents", "list", q] as const,
  detail: (school: string, id: string) =>
    ["school", school, "parents", "detail", id] as const,
  stats: (school: string) => ["school", school, "parents", "stats"] as const,
};

export function useParents(query: ParentQuery) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: parentKeys.list(school, query),
    queryFn: () => parentsService.list(query),
    placeholderData: (prev, prevQuery) =>
      prevQuery && prevQuery.queryKey[1] === school ? prev : undefined,
  });
}

export function useParent(id: string) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: parentKeys.detail(school, id),
    queryFn: () => parentsService.get(id),
    enabled: !!id,
  });
}

export function useParentStats() {
  const school = useSchoolScope();
  return useQuery({
    queryKey: parentKeys.stats(school),
    queryFn: () => parentsService.stats(),
  });
}

export function useExportUnattachedStudents() {
  return useMutation({
    mutationFn: () => parentsService.exportUnattached(),
  });
}

export function useCreateParent() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (input: ParentInput) => parentsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useUpdateParent() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ParentInput }) =>
      parentsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all(school) }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useDeleteParent() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (id: string) => parentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all(school) }),
  });
}

export function useBulkDeleteParents() {
  const qc = useQueryClient();
  const school = useSchoolScope();
  return useMutation({
    mutationFn: (ids: string[]) => parentsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all(school) }),
  });
}
