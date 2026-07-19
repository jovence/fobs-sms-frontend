"use client";

import { useQuery } from "@tanstack/react-query";
import { useSchoolScope } from "@/lib/query-keys";
import { dashboardService } from "./api/dashboard.service";

export const dashboardKeys = {
  overview: (school: string, year: string | undefined) =>
    ["school", school, "dashboard", "overview", year ?? "current"] as const,
};

/** Owner dashboard analytics for the active school (optionally a specific academic year). */
export function useDashboardAnalytics(year?: string) {
  const school = useSchoolScope();
  return useQuery({
    queryKey: dashboardKeys.overview(school, year),
    queryFn: () => dashboardService.overview(year),
  });
}
