import { pickService } from "@/lib/api-client";
import { withLatency } from "@/lib/mock";
import { isDemoSchool } from "@/features/auth/tenancy";
import { ApiError } from "@/types";
import { MARK_MAX } from "../types";
import type { MarkSheetOptions, MarkSheetPreview, MarkSheetSelection } from "../types";
import { seedClasses, seedExams, seedSubjects, synthesizeRows } from "../mock-data";
import { httpMarkSheetsService } from "./mark-sheets.http";

export interface MarkSheetsService {
  /** Subjects / exams / classes available for building a mark sheet (school-scoped). */
  getOptions(): Promise<MarkSheetOptions>;
  /** Resolve the marks table for a Subject + Exam (+ optional Class). Throws a 422
   *  {@link ApiError} ("No marks found for the selected criteria.") when empty. */
  preview(selection: MarkSheetSelection): Promise<MarkSheetPreview>;
  /** Generate the printable PDF (or ZIP when no class is chosen) and download it. */
  download(selection: MarkSheetSelection): Promise<void>;
}

// ---- Mock implementation (synthesizes a mark sheet offline) ----

/** Shared message so mock + live surface the identical empty-state copy. */
const NO_MARKS_MESSAGE = "No marks found for the selected criteria.";

const mockMarkSheetsService: MarkSheetsService = {
  async getOptions() {
    // A fresh (non-demo) school has no options yet — only the seeded demo schools
    // showcase subjects/exams/classes, matching the tenancy rules elsewhere.
    const demo = isDemoSchool();
    return withLatency(
      {
        subjects: demo ? [...seedSubjects] : [],
        exams: demo ? [...seedExams] : [],
        classes: demo ? [...seedClasses] : [],
      },
      300,
    );
  },

  async preview(selection) {
    const rows = isDemoSchool()
      ? synthesizeRows(selection.subjectId, selection.examId, selection.classId)
      : [];

    if (rows.length === 0) {
      // Mirror the backend's 422 so the UI's empty-preview path is exercised offline.
      throw new ApiError(NO_MARKS_MESSAGE, "validation", 422);
    }

    const subject = seedSubjects.find((s) => s.id === selection.subjectId);
    const exam = seedExams.find((e) => e.id === selection.examId);
    const cls = selection.classId
      ? seedClasses.find((c) => c.id === selection.classId)
      : undefined;

    return withLatency(
      {
        subject: {
          id: selection.subjectId,
          name: subject?.name ?? "Subject",
          code: subject?.code ?? "",
        },
        exam: { id: selection.examId, name: exam?.name ?? "Exam" },
        class: cls ? { id: cls.id, name: cls.name } : null,
        rows,
      },
      450,
    );
  },

  async download(selection) {
    // Offline stand-in for the PDF: build a CSV of the (deterministic) marks table
    // and trigger a browser download so the "Generate" action is exercised in mock mode.
    const rows = isDemoSchool()
      ? synthesizeRows(selection.subjectId, selection.examId, selection.classId)
      : [];
    if (rows.length === 0) throw new ApiError(NO_MARKS_MESSAGE, "validation", 422);

    const subject = seedSubjects.find((s) => s.id === selection.subjectId);
    const exam = seedExams.find((e) => e.id === selection.examId);
    const header = `Mark sheet — ${subject?.name ?? "Subject"} / ${exam?.name ?? "Exam"} (out of ${MARK_MAX})`;
    const lines = [
      header,
      "Matricule,Student,Class,Mark",
      ...rows.map(
        (r) =>
          `${r.matricule ?? ""},"${r.studentName.trim()}",${r.className},${r.mark ?? ""}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const fileName = `mark-sheet-${subject?.code ?? "subject"}-${selection.examId}.csv`;

    if (typeof window !== "undefined") {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }
    return withLatency(undefined, 500);
  },
};

export const markSheetsService: MarkSheetsService = pickService(
  mockMarkSheetsService,
  httpMarkSheetsService,
);
