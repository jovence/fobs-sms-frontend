/** Owner dashboard analytics — camelCase view model mapped from `/api/dashboard/overview`. */

export interface Series {
  labels: string[];
  data: number[];
}

export interface WorkloadSeries {
  labels: string[];
  classes: number[];
  subjects: number[];
}

export interface DashboardMetrics {
  totalStudents: number;
  studentGrowth: number;
  teachingStaff: number;
  staffGrowth: number;
  attendanceRate: number;
  attendanceChange: number;
  passRate: number;
  totalClasses: number;
  totalSubjects: number;
  totalExams: number;
  averageMarks: number;
}

export interface ClassPerformanceRow {
  name: string;
  average: number;
  teacher: string;
}

export interface ClassAttendanceRow {
  name: string;
  rate: number;
  studentCount: number;
}

export interface ClassEngagementRow {
  name: string;
  total: number;
  connected: number;
  rate: number;
}

export interface RecentParentRow {
  name: string;
  email: string;
  phone: string;
  studentsCount: number;
  isApproved: boolean;
  registeredAt: string;
}

export interface UpcomingExam {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
}

export interface AttendanceToday {
  total: number;
  present: number;
  rate: number;
}

export interface DashboardCharts {
  enrollmentTrend: Series;
  classDistribution: Series;
  genderDistribution: Series;
  monthlyAttendance: Series;
  teacherWorkload: WorkloadSeries;
  topClasses: ClassPerformanceRow[];
  attendanceByClass: ClassAttendanceRow[];
  subjectPerformance: Series;
}

export interface DashboardQuickStats {
  studentsThisMonth: number;
  attendanceToday: AttendanceToday;
  examsUpcoming: UpcomingExam[];
  lowAttendanceClasses: { name: string; rate: number }[];
}

export interface DashboardParentStats {
  totalParents: number;
  approvedParents: number;
  pendingParents: number;
  studentsWithParents: number;
  studentsWithoutParents: number;
  connectionRate: number;
  classesNeedingAttention: ClassEngagementRow[];
  recentParents: RecentParentRow[];
}

export interface DashboardAnalytics {
  academicYear: string;
  availableYears: string[];
  metrics: DashboardMetrics;
  charts: DashboardCharts;
  quickStats: DashboardQuickStats;
  parentStats: DashboardParentStats;
}
