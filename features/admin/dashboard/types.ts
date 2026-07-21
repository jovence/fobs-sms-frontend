import type { SubscriptionTier } from "@/features/admin/schools/types";

/** A single point on the 12-month platform-growth series. */
export interface GrowthPoint {
  month: string;
  schools: number;
  users: number;
}

/** A school in the "top schools by students" leaderboard. */
export interface TopSchool {
  name: string;
  acronym: string;
  students: number;
  tier: SubscriptionTier;
}

/** One `{ role, count }` bar in the users-by-role breakdown. */
export interface RoleCount {
  role: "owner" | "teacher" | "parent" | "admin";
  count: number;
}

/**
 * Platform-wide analytics for the SuperAdmin dashboard, normalised from the backend
 * `GET /api/dashboard/admin/dashboard` payload (see AdminDashboardService).
 */
export interface AdminDashboard {
  totals: {
    schools: number;
    students: number;
    teachers: number;
    owners: number;
    parents: number;
  };
  /** Estimated annual revenue (XAF) from paid subscriptions. */
  estimatedRevenue: number;
  subscriptionBreakdown: Record<SubscriptionTier, number>;
  usersByRole: RoleCount[];
  growth: GrowthPoint[];
  topSchools: TopSchool[];
}
