import { api } from "@/lib/api-client";
import type { SubscriptionTier } from "@/features/admin/schools/types";
import type { AdminDashboard, GrowthPoint, RoleCount, TopSchool } from "../types";
import type { AdminDashboardService } from "./admin-dashboard.service";

/**
 * Live implementation of {@link AdminDashboardService} against the Laravel backend
 * (`GET /api/dashboard/admin/dashboard`, SuperAdmin-scoped). Maps the wide analytics
 * payload assembled by `AdminDashboardService::data()` onto the UI's {@link AdminDashboard}.
 */

/** Aggregate counters block of the backend payload (`stats`). */
interface DashboardStats {
  total_schools: number;
  total_students: number;
  total_teachers: number;
  free_schools: number;
  basic_schools: number;
  pro_schools: number;
  owners: number;
  parents: number;
  teachers_users: number;
  admins: number;
  monthly_revenue: number;
  yearly_revenue: number;
}

/** A month bucket from the backend `monthlyGrowth` series. */
interface GrowthPayload {
  month: string;
  month_short: string;
  schools: number;
  users: number;
  students: number;
}

/** A raw `School` model row from `topSchoolsByStudents` (carries a `students_count` alias). */
interface TopSchoolPayload {
  name: string;
  acronym: string | null;
  subscription: string | null;
  students_count: number | string | null;
}

/** Shape of the whole `data` envelope returned by the endpoint (only the fields the UI reads). */
interface DashboardPayload {
  stats: DashboardStats;
  monthlyGrowth: GrowthPayload[];
  topSchoolsByStudents: TopSchoolPayload[];
}

function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toSubscription(value: string | null): SubscriptionTier {
  return value === "basic" || value === "pro" ? value : "free";
}

function mapGrowth(p: GrowthPayload): GrowthPoint {
  return { month: p.month_short, schools: p.schools, users: p.users };
}

function mapTopSchool(p: TopSchoolPayload): TopSchool {
  return {
    name: p.name,
    acronym: p.acronym ?? "",
    students: toNumber(p.students_count),
    tier: toSubscription(p.subscription),
  };
}

function mapDashboard(p: DashboardPayload): AdminDashboard {
  const s = p.stats;
  const usersByRole: RoleCount[] = [
    { role: "owner", count: s.owners },
    { role: "teacher", count: s.teachers_users },
    { role: "parent", count: s.parents },
    { role: "admin", count: s.admins },
  ];
  return {
    totals: {
      schools: s.total_schools,
      students: s.total_students,
      teachers: s.total_teachers,
      owners: s.owners,
      parents: s.parents,
    },
    // Backend `yearly_revenue` is the annual figure (monthly_revenue × 12); the card is annual.
    estimatedRevenue: s.yearly_revenue,
    subscriptionBreakdown: {
      free: s.free_schools,
      basic: s.basic_schools,
      pro: s.pro_schools,
    },
    usersByRole,
    growth: p.monthlyGrowth.map(mapGrowth),
    topSchools: p.topSchoolsByStudents.map(mapTopSchool),
  };
}

export const httpAdminDashboardService: AdminDashboardService = {
  async get(): Promise<AdminDashboard> {
    const data = await api.get<DashboardPayload>("/dashboard/admin/dashboard");
    return mapDashboard(data);
  },
};
