"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schoolsService } from "./api/schools.service";
import type { SchoolInput } from "./types";

const schoolKeys = { all: ["schools"] as const };

export function useSchools() {
  return useQuery({ queryKey: schoolKeys.all, queryFn: () => schoolsService.list() });
}

export function useCreateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SchoolInput) => schoolsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.all }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useUpdateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SchoolInput }) =>
      schoolsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.all }),
    // Form sheet shows its own contextual/translated error; opt out of the global toast.
    meta: { suppressErrorToast: true },
  });
}

export function useDeleteSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.all }),
  });
}
