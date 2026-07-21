import { api, downloadFile } from "@/lib/api-client";
import { coverageOf } from "../types";
import type { GceClass, GceLevel, MockGceIndex } from "../types";
import type { MockGceService } from "./mock-gce.service";

/**
 * Live implementation of {@link MockGceService} against the Laravel backend
 * (`/api/dashboard/mock-gce`, `X-School-Id` tenancy). The index reuses
 * `GetMockGceIndexAction`; the slips/summary endpoints stream PDFs, so they go
 * through {@link downloadFile} (GET) rather than the JSON envelope.
 *
 * NOTE (edge case): the backend slip/summary actions redirect (HTTP web redirect)
 * when no 6th-sequence exam exists for the year — `downloadFile` may then save the
 * followed HTML response. The index's `hasSequenceSixExam` flag lets the UI warn
 * up-front so this rarely fires.
 */

/** Shape of the backend index payload (raw models serialized by `compact(...)`). */
interface MockGceIndexPayload {
  academicYear?: string | null;
  exam6?: { id: number | string } | null;
  classes?: Array<{
    id: number | string;
    name: string;
    level: string | null;
    student_count: number | string | null;
    students_marked: number | string | null;
    marks_count: number | string | null;
  }>;
}

/** Coerce a possibly-stringified integer to a safe number. */
function toInt(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Normalise the backend level ('O' | 'A'); default to O-Level defensively. */
function toLevel(value: string | null): GceLevel {
  return value === "A" ? "A" : "O";
}

/** URL-safe slug for download filenames, mirroring the backend's Str::slug output. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapClass(c: NonNullable<MockGceIndexPayload["classes"]>[number]): GceClass {
  const candidates = toInt(c.student_count);
  const studentsMarked = toInt(c.students_marked);
  return {
    id: String(c.id),
    name: c.name,
    level: toLevel(c.level),
    candidates,
    studentsMarked,
    marksCount: toInt(c.marks_count),
    coverage: coverageOf(studentsMarked, candidates),
  };
}

function mapIndex(payload: MockGceIndexPayload): MockGceIndex {
  return {
    academicYear: payload.academicYear ?? "",
    hasSequenceSixExam: Boolean(payload.exam6),
    classes: (payload.classes ?? []).map(mapClass),
  };
}

export const httpMockGceService: MockGceService = {
  async index() {
    const data = await api.get<MockGceIndexPayload>("/dashboard/mock-gce");
    return mapIndex(data);
  },

  async downloadSlips(classId, className) {
    await downloadFile(`/dashboard/mock-gce/${classId}/slips`, {
      fallbackName: `MOCK_GCE_SLIPS_${slug(className)}.pdf`,
    });
  },

  async downloadSummary(classId, className) {
    await downloadFile(`/dashboard/mock-gce/${classId}/summary`, {
      fallbackName: `Mock_GCE_Summary_${slug(className)}.pdf`,
    });
  },
};
