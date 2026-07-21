import { api } from "@/lib/api-client";
import { ApiError } from "@/types";
import type { AttendanceService } from "./attendance.service";
import type { RosterStudent } from "../types";

interface StudentPayload {
  id: number | string;
  full_name: string;
  matricule: string | null;
  image: string | null;
}

interface StudentsIndexPayload {
  students: StudentPayload[];
}

function mapRosterStudent(student: StudentPayload): RosterStudent {
  return {
    id: String(student.id),
    fullName: student.full_name,
    matricule: student.matricule,
    photoUrl: student.image,
  };
}

async function fetchRosterPage(
  classId: string,
  page: number,
): Promise<{ items: RosterStudent[]; totalPages: number }> {
  const params = new URLSearchParams({
    class_id: classId,
    page: String(page),
    per_page: "200",
  });

  const res = await api.list<StudentPayload>(`/dashboard/students?${params.toString()}`);
  const payload = res.data as unknown as StudentsIndexPayload;

  return {
    items: (payload.students ?? []).map(mapRosterStudent),
    totalPages: res.meta?.last_page ?? 1,
  };
}

/**
 * Live implementation of {@link AttendanceService} against the Laravel backend.
 *
 * GAP — no backend support for the class-wide session model this module expects. The roster
 * can be built from `/dashboard/students?class_id=...`, but the attendance API itself is
 * per-STUDENT record CRUD only:
 *   - GET    /dashboard/students/{studentId}/attendance   (one student's paginated records)
 *   - POST   /dashboard/students/{studentId}/attendance
 *   - PUT    /dashboard/students/{studentId}/attendance/{attendanceId}
 *   - DELETE /dashboard/students/{studentId}/attendance/{attendanceId}
 * There is no endpoint to list/fetch/save class-wide sessions — the backend has no "session"
 * concept yet (records carry student_id/subject/term/hours, not a session grouping).
 */
export const httpAttendanceService: AttendanceService = {
  async getRoster(classId) {
    const firstPage = await fetchRosterPage(classId, 1);
    if (firstPage.totalPages <= 1) return firstPage.items;

    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        fetchRosterPage(classId, index + 2),
      ),
    );

    return [...firstPage.items, ...remainingPages.flatMap((page) => page.items)];
  },

  async listSessions() {
    throw new ApiError(
      "Attendance sessions are not available yet.",
      "unknown",
      501,
    );
  },

  async getSession() {
    throw new ApiError(
      "Attendance session lookup is not available yet.",
      "unknown",
      501,
    );
  },

  async saveSession() {
    throw new ApiError(
      "Saving attendance sessions is not available yet.",
      "unknown",
      501,
    );
  },
};
