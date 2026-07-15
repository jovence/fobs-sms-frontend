export type AttendanceStatus = "Present" | "Late" | "Absent";

export interface ClassOption {
  id: string;
  name: string;
}

export interface SubjectOption {
  id: string;
  name: string;
}

/** A single student as shown in the record roster. */
export interface RosterStudent {
  id: string;
  fullName: string;
  matricule: string | null;
  photoUrl: string | null;
}

/** Per-student mark inside a saved session. */
export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  hours: number;
}

/** Aggregated present/late/absent tally for a session. */
export interface AttendanceCounts {
  present: number;
  late: number;
  absent: number;
  total: number;
}

/** A saved attendance session (one class + subject + date). */
export interface AttendanceSession {
  id: string;
  date: string; // ISO
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  counts: AttendanceCounts;
  /** Attendance rate as a percentage (0–100): (present + late) / total. */
  rate: number;
  createdAt: string;
}

export interface AttendanceQuery {
  page: number;
  perPage: number;
  search?: string;
  classId?: string;
  sortBy?: "date" | "className" | "subjectName" | "present" | "rate";
  sortDir?: "asc" | "desc";
}

export interface SaveSessionInput {
  date: string;
  classId: string;
  subjectId: string;
  records: AttendanceRecord[];
}

/** Compute present/late/absent tally from a list of records. */
export function tallyRecords(records: AttendanceRecord[]): AttendanceCounts {
  const counts: AttendanceCounts = {
    present: 0,
    late: 0,
    absent: 0,
    total: records.length,
  };
  for (const r of records) {
    if (r.status === "Present") counts.present += 1;
    else if (r.status === "Late") counts.late += 1;
    else counts.absent += 1;
  }
  return counts;
}

/** Attendance rate as a percentage: everyone who showed up (present + late). */
export function attendanceRate(counts: AttendanceCounts): number {
  if (counts.total === 0) return 0;
  return Math.round(((counts.present + counts.late) / counts.total) * 100);
}
