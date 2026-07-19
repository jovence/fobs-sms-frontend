import { api } from "@/lib/api-client";
import type {
  DashboardAnalytics,
  DashboardCharts,
  DashboardMetrics,
  DashboardParentStats,
  DashboardQuickStats,
} from "../types";
import type { DashboardService } from "./dashboard.service";

/**
 * Live implementation of {@link DashboardService} against `GET /api/dashboard/overview`
 * (owner-scoped via the `X-School-Id` header). Maps the backend's snake_case analytics
 * payload — ported from the legacy Blade SchoolDashboardController — onto the camelCase
 * {@link DashboardAnalytics} view model.
 */

interface SeriesPayload {
  labels: string[];
  data: number[];
}

interface OverviewPayload {
  academic_year: string;
  available_years: string[];
  metrics: {
    total_students: number;
    student_growth: number;
    teaching_staff: number;
    staff_growth: number;
    attendance_rate: number;
    attendance_change: number;
    pass_rate: number;
    total_classes: number;
    total_subjects: number;
    total_exams: number;
    average_marks: number;
  };
  charts: {
    enrollment_trend: SeriesPayload;
    class_distribution: SeriesPayload;
    gender_distribution: SeriesPayload;
    monthly_attendance: SeriesPayload;
    teacher_workload: { labels: string[]; classes: number[]; subjects: number[] };
    top_classes: { name: string; average: number; teacher: string }[];
    attendance_by_class: { name: string; rate: number; student_count: number }[];
    subject_performance: SeriesPayload;
  };
  quick_stats: {
    students_this_month: number;
    attendance_today: { total: number; present: number; rate: number };
    exams_upcoming: { id: number | string; name: string; start_date: string | null; end_date: string | null }[];
    low_attendance_classes: { name: string; rate: number }[];
  };
  parent_stats: {
    total_parents: number;
    approved_parents: number;
    pending_parents: number;
    students_with_parents: number;
    students_without_parents: number;
    connection_rate: number;
    classes_needing_attention: { name: string; total: number; connected: number; rate: number }[];
    recent_parents: {
      name: string;
      email: string;
      phone: string;
      students_count: number;
      is_approved: boolean;
      registered_at: string | null;
    }[];
  };
}

function mapMetrics(m: OverviewPayload["metrics"]): DashboardMetrics {
  return {
    totalStudents: m.total_students,
    studentGrowth: m.student_growth,
    teachingStaff: m.teaching_staff,
    staffGrowth: m.staff_growth,
    attendanceRate: m.attendance_rate,
    attendanceChange: m.attendance_change,
    passRate: m.pass_rate,
    totalClasses: m.total_classes,
    totalSubjects: m.total_subjects,
    totalExams: m.total_exams,
    averageMarks: m.average_marks,
  };
}

function mapCharts(c: OverviewPayload["charts"]): DashboardCharts {
  return {
    enrollmentTrend: c.enrollment_trend,
    classDistribution: c.class_distribution,
    genderDistribution: c.gender_distribution,
    monthlyAttendance: c.monthly_attendance,
    teacherWorkload: c.teacher_workload,
    topClasses: c.top_classes,
    attendanceByClass: c.attendance_by_class.map((r) => ({
      name: r.name,
      rate: r.rate,
      studentCount: r.student_count,
    })),
    subjectPerformance: c.subject_performance,
  };
}

function mapQuickStats(q: OverviewPayload["quick_stats"]): DashboardQuickStats {
  return {
    studentsThisMonth: q.students_this_month,
    attendanceToday: q.attendance_today,
    examsUpcoming: q.exams_upcoming.map((e) => ({
      id: String(e.id),
      name: e.name,
      startDate: e.start_date,
      endDate: e.end_date,
    })),
    lowAttendanceClasses: q.low_attendance_classes,
  };
}

function mapParentStats(p: OverviewPayload["parent_stats"]): DashboardParentStats {
  return {
    totalParents: p.total_parents,
    approvedParents: p.approved_parents,
    pendingParents: p.pending_parents,
    studentsWithParents: p.students_with_parents,
    studentsWithoutParents: p.students_without_parents,
    connectionRate: p.connection_rate,
    classesNeedingAttention: p.classes_needing_attention,
    recentParents: p.recent_parents.map((r) => ({
      name: r.name,
      email: r.email,
      phone: r.phone,
      studentsCount: r.students_count,
      isApproved: r.is_approved,
      registeredAt: r.registered_at ?? "",
    })),
  };
}

export const httpDashboardService: DashboardService = {
  async overview(year?: string): Promise<DashboardAnalytics> {
    const query = year ? `?year=${encodeURIComponent(year)}` : "";
    const p = await api.get<OverviewPayload>(`/dashboard/overview${query}`);
    return {
      academicYear: p.academic_year,
      availableYears: p.available_years,
      metrics: mapMetrics(p.metrics),
      charts: mapCharts(p.charts),
      quickStats: mapQuickStats(p.quick_stats),
      parentStats: mapParentStats(p.parent_stats),
    };
  },
};
