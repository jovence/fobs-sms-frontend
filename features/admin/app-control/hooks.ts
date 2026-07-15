"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appControlService } from "./api/app-control.service";
import type { AppType, AppUpdateInput } from "./types";

const keys = { all: ["admin-app-control"] as const };

export function useAppUpdates() {
  return useQuery({ queryKey: keys.all, queryFn: () => appControlService.getAll() });
}

export function useSaveAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appType, input }: { appType: AppType; input: AppUpdateInput }) =>
      appControlService.setSettings(appType, input),
    onSuccess: (data) => qc.setQueryData(keys.all, data),
  });
}

export function useToggleApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appType: AppType) => appControlService.toggle(appType),
    onSuccess: (data) => qc.setQueryData(keys.all, data),
  });
}
