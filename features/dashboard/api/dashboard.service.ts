import type { DashboardAnalytics } from "../types";
import { httpDashboardService } from "./dashboard.http";

/** The dashboard analytics service — one read of the owner overview payload. */
export interface DashboardService {
  overview(year?: string): Promise<DashboardAnalytics>;
}

export const dashboardService = httpDashboardService;
