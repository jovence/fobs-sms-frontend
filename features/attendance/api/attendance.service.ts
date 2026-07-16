import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import {
  attendanceRate,
  tallyRecords,
  type AttendanceQuery,
  type AttendanceSession,
  type RosterStudent,
  type SaveSessionInput,
} from "../types";
import { classNameFor, subjectNameFor } from "@/features/academics/api/academics.service";
import { rosterForClass, seedSessions } from "../mock-data";

export interface AttendanceService {
  getRoster(classId: string): Promise<RosterStudent[]>;
  listSessions(query: AttendanceQuery): Promise<Paginated<AttendanceSession>>;
  getSession(id: string): Promise<AttendanceSession>;
  saveSession(input: SaveSessionInput): Promise<AttendanceSession>;
}

// ---- Mock implementation (persists to localStorage so saves survive reloads) ----

function db(): AttendanceSession[] {
  return mockStore.get<AttendanceSession[]>(
    scopedKey("attendance"),
    isDemoSchool() ? seedSessions : [],
  );
}
function commit(next: AttendanceSession[]) {
  mockStore.set(scopedKey("attendance"), next);
}
function className(classId: string) {
  return classNameFor(classId);
}
function subjectName(subjectId: string) {
  return subjectNameFor(subjectId);
}

const mockAttendanceService: AttendanceService = {
  async getRoster(classId) {
    return withLatency(rosterForClass(classId), 400);
  },

  async listSessions(query) {
    let rows = [...db()];
    const { search, classId, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.className.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q),
      );
    }
    if (classId) rows = rows.filter((r) => r.classId === classId);

    if (sortBy) {
      const dir = sortDir === "desc" ? -1 : 1;
      rows.sort((a, b) => {
        const av =
          sortBy === "present"
            ? a.counts.present
            : sortBy === "rate"
              ? a.rate
              : a[sortBy];
        const bv =
          sortBy === "present"
            ? b.counts.present
            : sortBy === "rate"
              ? b.rate
              : b[sortBy];
        return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
      });
    }

    const total = rows.length;
    const start = (page - 1) * perPage;
    const items = rows.slice(start, start + perPage);

    return withLatency(
      { items, page, perPage, total, totalPages: Math.ceil(total / perPage) || 1 },
      450,
    );
  },

  async getSession(id) {
    const found = db().find((r) => r.id === id);
    if (!found) throw new Error("Session not found");
    return withLatency(found, 250);
  },

  async saveSession(input) {
    const counts = tallyRecords(input.records);
    const session: AttendanceSession = {
      id: `att_${Date.now().toString(36)}`,
      date: input.date,
      classId: input.classId,
      className: className(input.classId),
      subjectId: input.subjectId,
      subjectName: subjectName(input.subjectId),
      counts,
      rate: attendanceRate(counts),
      createdAt: new Date().toISOString(),
    };
    commit([session, ...db()]);
    return withLatency(session, 550);
  },
};

export const attendanceService: AttendanceService =
  API_MODE === "live" ? mockAttendanceService : mockAttendanceService;
