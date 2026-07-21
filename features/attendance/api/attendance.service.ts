import type { Paginated } from "@/types";
import type {
  AttendanceQuery,
  AttendanceSession,
  RosterStudent,
  SaveSessionInput,
} from "../types";
import { httpAttendanceService } from "./attendance.http";

export interface AttendanceService {
  getRoster(classId: string): Promise<RosterStudent[]>;
  listSessions(query: AttendanceQuery): Promise<Paginated<AttendanceSession>>;
  getSession(id: string): Promise<AttendanceSession>;
  saveSession(input: SaveSessionInput): Promise<AttendanceSession>;
}

export const attendanceService: AttendanceService = httpAttendanceService;
