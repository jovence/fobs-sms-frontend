"use client";

import { useQuery } from "@tanstack/react-query";
import { adminDashboardService } from "./api/admin-dashboard.service";

const keys = { all: ["admin-dashboard"] as const };

export function useAdminDashboard() {
  return useQuery({ queryKey: keys.all, queryFn: () => adminDashboardService.get() });
}
