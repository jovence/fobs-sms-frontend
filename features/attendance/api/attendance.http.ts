import { ApiError } from "@/types";
import type { AttendanceService } from "./attendance.service";

/**
 * Live implementation of {@link AttendanceService} against the Laravel backend.
 *
 * GAP — no backend support for the class-wide session model this module expects.
 * The frontend contract is built around *class + subject + date* attendance SESSIONS
 * (`getRoster` by class, `listSessions`, `getSession`, `saveSession` for a whole class at
 * once). The backend's owner-dashboard attendance API is per-STUDENT record CRUD only:
 *   - GET    /dashboard/students/{studentId}/attendance   (one student's paginated records)
 *   - POST   /dashboard/students/{studentId}/attendance
 *   - PUT    /dashboard/students/{studentId}/attendance/{attendanceId}
 *   - DELETE /dashboard/students/{studentId}/attendance/{attendanceId}
 * There is no endpoint to (a) fetch a class roster, (b) list class-wide sessions,
 * (c) fetch a session by id, or (d) save a session for a whole class in one call — the
 * backend has no "session" concept at all (records carry student_id/subject/term/hours,
 * not a session grouping). So every method here throws a typed 501 until the backend
 * exposes session-oriented (or class-roster) endpoints. See NOTE in the returned summary.
 */
export const httpAttendanceService: AttendanceService = {
  async getRoster() {
    throw new ApiError(
      "Class attendance roster is not available yet.",
      "unknown",
      501,
    );
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
