import { pickService } from "@/lib/api-client";
import { withLatency } from "@/lib/mock";
import { isDemoSchool } from "@/features/auth/tenancy";
import { coverageOf } from "../types";
import type { GceClass, MockGceIndex } from "../types";
import { httpMockGceService } from "./mock-gce.http";

export interface MockGceService {
  /** Eligible GCE classes for the active school + sequence-6 context. */
  index(): Promise<MockGceIndex>;
  /** Download the combined per-candidate result-slips PDF for a class. */
  downloadSlips(classId: string, className: string): Promise<void>;
  /** Download the class-wide summary PDF for a class. */
  downloadSummary(classId: string, className: string): Promise<void>;
}

// ---- Mock implementation (offline demo data + text stand-in downloads) ----

/** URL-safe slug for filenames, mirroring the backend's Str::slug output. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Trigger a browser download of an in-memory Blob (offline stand-in for the live PDF). */
function saveBlob(blob: Blob, filename: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Two realistic demo classes matching the old app's screenshots (Form 5 + Upper Sixth). */
function demoClasses(): GceClass[] {
  const rows: Array<Omit<GceClass, "coverage">> = [
    { id: "gce_form5", name: "Form 5", level: "O", candidates: 48, studentsMarked: 45, marksCount: 402 },
    {
      id: "gce_upper6",
      name: "Upper Sixth",
      level: "A",
      candidates: 31,
      studentsMarked: 28,
      marksCount: 168,
    },
  ];
  return rows.map((r) => ({ ...r, coverage: coverageOf(r.studentsMarked, r.candidates) }));
}

const mockMockGceService: MockGceService = {
  async index() {
    const isDemo = isDemoSchool();
    return withLatency<MockGceIndex>(
      {
        academicYear: "2025/2026",
        hasSequenceSixExam: isDemo,
        // Non-demo schools start empty, exercising the "No GCE classes found" state.
        classes: isDemo ? demoClasses() : [],
      },
      450,
    );
  },

  async downloadSlips(_classId, className) {
    const body =
      `MOCK GCE — RESULT SLIPS (demo)\n` +
      `Class: ${className}\n\n` +
      `This is an offline stand-in. In live mode a combined A4-portrait PDF\n` +
      `with one Cameroon GCE-style slip per candidate is streamed from the API.\n`;
    saveBlob(new Blob([body], { type: "text/plain;charset=utf-8" }), `MOCK_GCE_SLIPS_${slug(className)}.txt`);
    return withLatency(undefined, 600);
  },

  async downloadSummary(_classId, className) {
    const body =
      `Candidate,Passes,Points,Verdict\n` +
      `"(demo) ${className} summary",—,—,See live mode\n`;
    saveBlob(new Blob([body], { type: "text/csv;charset=utf-8" }), `Mock_GCE_Summary_${slug(className)}.csv`);
    return withLatency(undefined, 600);
  },
};

export const mockGceService: MockGceService = pickService(mockMockGceService, httpMockGceService);
