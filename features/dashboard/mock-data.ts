/** Realistic dashboard fixtures — shaped like what the backend analytics endpoint will return. */

export interface EnrollmentPoint {
  month: string;
  students: number;
  target: number;
}

export interface ActivityEntry {
  id: string;
  type: "enrollment" | "marks" | "attendance" | "payment" | "teacher";
  title: string;
  meta: string;
  at: string;
}

export interface UpcomingClass {
  id: string;
  subject: string;
  className: string;
  teacher: string;
  time: string;
  room: string;
}

export const enrollmentSeries: EnrollmentPoint[] = [
  { month: "Sep", students: 1180, target: 1150 },
  { month: "Oct", students: 1210, target: 1180 },
  { month: "Nov", students: 1198, target: 1210 },
  { month: "Dec", students: 1225, target: 1240 },
  { month: "Jan", students: 1252, target: 1260 },
  { month: "Feb", students: 1268, target: 1275 },
  { month: "Mar", students: 1284, target: 1290 },
];

/** Tiny series for card sparklines. */
export const sparks = {
  students: [12, 18, 15, 22, 20, 28, 26, 32],
  teachers: [40, 42, 41, 44, 45, 46, 48, 47],
  attendance: [88, 90, 87, 91, 93, 92, 94, 93],
  pass: [72, 74, 71, 76, 78, 77, 80, 78],
};

export const attendanceBreakdown = { present: 1198, absent: 61, late: 25 };

export const recentActivity: ActivityEntry[] = [
  { id: "a1", type: "enrollment", title: "3 students enrolled in Form 4 Science", meta: "Admissions", at: "12m ago" },
  { id: "a2", type: "marks", title: "Sequence 3 marks submitted — Mathematics", meta: "M. Etienne", at: "48m ago" },
  { id: "a3", type: "payment", title: "Tuition payment received · 200,000 XAF", meta: "Bursary", at: "2h ago" },
  { id: "a4", type: "attendance", title: "Attendance recorded for Form 5 Arts", meta: "Mme Bih", at: "3h ago" },
  { id: "a5", type: "teacher", title: "New teacher approved — Physics", meta: "Staff", at: "5h ago" },
];

export const upcomingClasses: UpcomingClass[] = [
  { id: "u1", subject: "Mathematics", className: "Form 4 Sci", teacher: "M. Etienne", time: "08:00", room: "B-12" },
  { id: "u2", subject: "English Language", className: "Form 3 A", teacher: "Mme Bih", time: "09:30", room: "A-04" },
  { id: "u3", subject: "Physics", className: "Upper Sixth", teacher: "Dr. Nkeng", time: "11:00", room: "Lab-2" },
  { id: "u4", subject: "History", className: "Form 5 Arts", teacher: "M. Tabi", time: "13:15", room: "C-08" },
];
