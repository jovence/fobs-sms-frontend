"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { parentsService } from "./api/parents.service";
import type { ParentInput, ParentQuery } from "./types";

export const parentKeys = {
  all: ["parents"] as const,
  list: (q: ParentQuery) => ["parents", "list", q] as const,
};

export function useParents(query: ParentQuery) {
  return useQuery({
    queryKey: parentKeys.list(query),
    queryFn: () => parentsService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ParentInput) => parentsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useUpdateParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ParentInput }) =>
      parentsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useDeleteParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all }),
  });
}

export function useBulkDeleteParents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => parentsService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentKeys.all }),
  });
}
