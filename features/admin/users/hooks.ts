"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUsersService } from "./api/admin-users.service";
import type { AdminUserQuery } from "./types";

const keys = { all: ["admin-users"] as const, list: (q: AdminUserQuery) => ["admin-users", q] as const };

export function useAdminUsers(query: AdminUserQuery) {
  return useQuery({
    queryKey: keys.list(query),
    queryFn: () => adminUsersService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUsersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useBulkDeleteUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminUsersService.bulkRemove(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
