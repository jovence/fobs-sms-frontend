import { pickService } from "@/lib/api-client";
import { withLatency } from "@/lib/mock";
import { isDemoSchool } from "@/features/auth/tenancy";
import {
  resultSummaryExamLabel,
  type GenerateResultSummaryInput,
  type ResultSummaryOptions,
} from "../types";
import { httpResultSummaryService } from "./result-summary.http";

export interface ResultSummaryService {
  /** Classes + exams for the two generator dropdowns, scoped to the active school. */
  options(): Promise<ResultSummaryOptions>;
  /**
   * Generate and download the landscape roster. Live: streams a PDF (throws {@link ApiError}
   * on a 422). Mock: downloads a small CSV stand-in so the button "works" offline.
   */
  generate(input: GenerateResultSummaryInput): Promise<void>;
}

// ---- Mock implementation (read-only demo data; no persistence needed) ----

const DEMO_CLASSES = [
  { id: "cls_1", name: "Form 1" },
  { id: "cls_2", name: "Form 2" },
  { id: "cls_3", name: "Form 3" },
  { id: "cls_4", name: "Form 4" },
] as const;

const DEMO_EXAMS = [
  { id: "exm_1", name: "First Sequence", sequence: 1, term: "First", academicYear: "2025-2026" },
  { id: "exm_2", name: "Second Sequence", sequence: 2, term: "First", academicYear: "2025-2026" },
  { id: "exm_3", name: "Third Sequence", sequence: 3, term: "Second", academicYear: "2025-2026" },
] as const;

const DEMO_SUBJECTS = ["English", "French", "Mathematics", "Biology", "History"] as const;

/** Trigger a browser download for a Blob — the offline equivalent of `downloadFile`. */
function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const mockResultSummaryService: ResultSummaryService = {
  async options() {
    // Fresh (non-demo) schools have no marks yet — hand back empty lists so the
    // empty-state shows, matching the other mock services' tenancy behaviour.
    if (!isDemoSchool()) {
      return withLatency({ classes: [], exams: [] }, 200);
    }
    return withLatency(
      {
        classes: DEMO_CLASSES.map((c) => ({ ...c })),
        exams: DEMO_EXAMS.map((e) => ({
          id: e.id,
          name: e.name,
          term: e.term,
          academicYear: e.academicYear,
          sequence: e.sequence,
          label: resultSummaryExamLabel(e),
        })),
      },
      250,
    );
  },

  async generate({ classId, examId }) {
    const cls = DEMO_CLASSES.find((c) => c.id === classId);
    const exam = DEMO_EXAMS.find((e) => e.id === examId);

    // Build a small CSV stand-in for the real landscape PDF so the flow works offline.
    const header = ["#", "Student", ...DEMO_SUBJECTS, "Average"];
    const rows = Array.from({ length: 8 }, (_, i) => {
      const marks = DEMO_SUBJECTS.map(() => (8 + Math.random() * 10).toFixed(1));
      const avg = (marks.reduce((s, m) => s + Number(m), 0) / marks.length).toFixed(2);
      return [String(i + 1), `Student ${i + 1}`, ...marks, avg];
    });
    const title = `Result Summary — ${cls?.name ?? "Class"} — ${exam?.name ?? "Exam"}`;
    const csv = [title, "", header.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const filename = `result-summary-${cls?.name ?? "class"}-${exam?.name ?? "exam"}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .concat(".csv");

    await withLatency(undefined, 600);
    triggerBlobDownload(blob, filename);
  },
};

export const resultSummaryService: ResultSummaryService = pickService(
  mockResultSummaryService,
  httpResultSummaryService,
);
