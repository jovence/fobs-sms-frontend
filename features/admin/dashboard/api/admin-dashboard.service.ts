import type { AdminDashboard } from "../types";
import { httpAdminDashboardService } from "./admin-dashboard.http";

export interface AdminDashboardService {
  get(): Promise<AdminDashboard>;
}

export const adminDashboardService: AdminDashboardService = httpAdminDashboardService;
