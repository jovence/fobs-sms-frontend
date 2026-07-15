"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminActivityService } from "./api/admin-activity.service";
import type { ActivityQuery } from "./types";

export function useActivity(query: ActivityQuery) {
  return useQuery({
    queryKey: ["admin-activity", query],
    queryFn: () => adminActivityService.list(query),
    placeholderData: keepPreviousData,
  });
}
