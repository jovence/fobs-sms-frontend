import { pickService } from "@/lib/api-client";
import type { DashboardAnalytics } from "../types";
import { httpDashboardService } from "./dashboard.http";

/** The dashboard analytics service — one read of the owner overview payload. */
export interface DashboardService {
  overview(year?: string): Promise<DashboardAnalytics>;
}

// ---------------------------------------------------------------------------
// Mock — a coherent demo school so the dashboard is alive without a backend.
// ---------------------------------------------------------------------------

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const YEAR = "2025-2026";

function last12Months(): string[] {
  // Deterministic labels ending "Jul 2026" to mirror the demo screenshots.
  const names = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const years = [2025, 2025, 2025, 2025, 2025, 2026, 2026, 2026, 2026, 2026, 2026, 2026];
  return names.map((m, i) => `${m} ${years[i]}`);
}

const mockAnalytics: DashboardAnalytics = {
  academicYear: YEAR,
  availableYears: ["2025-2026", "2024-2025"],
  metrics: {
    totalStudents: 360,
    studentGrowth: 12.4,
    teachingStaff: 39,
    staffGrowth: 8.1,
    attendanceRate: 91.2,
    attendanceChange: 1.8,
    passRate: 70.3,
    totalClasses: 9,
    totalSubjects: 25,
    totalExams: 6,
    averageMarks: 11.6,
  },
  charts: {
    enrollmentTrend: {
      labels: last12Months(),
      data: [0, 320, 352, 356, 356, 357, 357, 358, 359, 360, 360, 360],
    },
    classDistribution: {
      labels: ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "L6 Art", "L6 Sci", "U6 Art", "U6 Sci"],
      data: [54, 48, 41, 40, 55, 30, 22, 43, 27],
    },
    genderDistribution: { labels: ["Male", "Female"], data: [150, 210] },
    monthlyAttendance: { labels: MONTHS, data: [88.4, 90.1, 89.7, 92.3, 91.0, 91.2] },
    teacherWorkload: {
      labels: ["Ngala", "Njodzeka", "Nfor", "Noumen", "Leandre", "Kamayam"],
      classes: [7, 4, 3, 3, 2, 2],
      subjects: [18, 6, 3, 3, 2, 2],
    },
    topClasses: [
      { name: "Form 4", average: 12.7, teacher: "Lydwina" },
      { name: "Form 1", average: 12.8, teacher: "Williet" },
      { name: "Form 3", average: 12.1, teacher: "Jeanna" },
      { name: "Form 2", average: 11.7, teacher: "Precious" },
      { name: "Form 5", average: 10.8, teacher: "Kamayam Lyne" },
    ],
    attendanceByClass: [
      { name: "Form 1", rate: 93.6, studentCount: 54 },
      { name: "Form 4", rate: 92.1, studentCount: 40 },
      { name: "Form 3", rate: 90.4, studentCount: 41 },
      { name: "Form 2", rate: 89.8, studentCount: 48 },
      { name: "Form 5", rate: 88.2, studentCount: 55 },
    ],
    subjectPerformance: {
      labels: ["Biology", "English", "Geography", "History", "Maths"],
      data: [14.9, 13.2, 12.1, 11.8, 7.5],
    },
  },
  quickStats: {
    studentsThisMonth: 8,
    attendanceToday: { total: 340, present: 310, rate: 91.2 },
    examsUpcoming: [],
    lowAttendanceClasses: [{ name: "U6 Science", rate: 68.4 }],
  },
  parentStats: {
    totalParents: 1,
    approvedParents: 1,
    pendingParents: 0,
    studentsWithParents: 3,
    studentsWithoutParents: 357,
    connectionRate: 0.8,
    classesNeedingAttention: [
      { name: "Form 1", total: 54, connected: 0, rate: 0 },
      { name: "Form 2", total: 48, connected: 0, rate: 0 },
      { name: "Form 3", total: 41, connected: 0, rate: 0 },
      { name: "Form 4", total: 40, connected: 0, rate: 0 },
      { name: "Form 5", total: 55, connected: 1, rate: 1.8 },
    ],
    recentParents: [
      {
        name: "Boreil Fobs",
        email: "boreilfobs@outlook.fr",
        phone: "690383299",
        studentsCount: 3,
        isApproved: true,
        registeredAt: "7 months ago",
      },
    ],
  },
};

const mockDashboardService: DashboardService = {
  async overview(): Promise<DashboardAnalytics> {
    // Clone so callers can't mutate the shared fixture.
    return structuredClone(mockAnalytics);
  },
};

export const dashboardService = pickService(mockDashboardService, httpDashboardService);
