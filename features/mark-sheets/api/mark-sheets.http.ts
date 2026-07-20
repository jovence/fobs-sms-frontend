import { api, downloadFile } from "@/lib/api-client";
import type {
  MarkSheetOptions,
  MarkSheetPreview,
  MarkSheetRow,
  MarkSheetSelection,
} from "../types";
import type { MarkSheetsService } from "./mark-sheets.service";

/**
 * Live implementation of {@link MarkSheetsService} against the Laravel
 * `MarkSheetController` (`/api/dashboard/mark-sheets`, `X-School-Id` tenancy):
 *
 *  - `getOptions` maps the `index` payload (subjects / exams / classes resources).
 *  - `preview` posts the selection and maps the returned `MarkResource` collection
 *     onto the UI's marks table; the backend answers 422 "No marks found for the
 *     selected criteria." when empty, which `lib/api-client` raises as an `ApiError`.
 *  - `download` first POSTs `generate` (stores the PDF, or a ZIP when no class is
 *     chosen), then streams the file: `downloadFile` against the download route when
 *     a class is chosen (auth + filename via Content-Disposition), else opens the
 *     returned ZIP `download_url`.
 */

/** Shape of the backend `SubjectResource`. */
interface SubjectPayload {
  id: number | string;
  name: string;
  code: string | null;
}
/** Shape of the backend `ExamResource`. */
interface ExamPayload {
  id: number | string;
  name: string;
  term: number | string | null;
}
/** Shape of the backend `SchoolClassResource`. */
interface ClassPayload {
  id: number | string;
  name: string;
}

/** Shape of the `index` payload (`GetMarkSheetIndexAction`). */
interface IndexPayload {
  subjects: SubjectPayload[];
  exams: ExamPayload[];
  classes: ClassPayload[];
  currentAcademicYear?: string;
}

/** Shape of one `MarkResource` (student + class eager-loaded on preview). */
interface MarkPayload {
  id: number | string;
  student_id: number | string;
  mark: number | string | null;
  student?: { full_name?: string | null; matricule?: string | null } | null;
  class?: { name?: string | null } | null;
}

/** Shape of the `preview` payload. */
interface PreviewPayload {
  subject: SubjectPayload;
  exam: ExamPayload;
  class: ClassPayload | null;
  marks: MarkPayload[];
  download_url?: string | null;
}

/** Coerce the backend `mark` (may arrive as a numeric string) to a number | null. */
function toMark(value: number | string | null): number | null {
  if (value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapRow(p: MarkPayload): MarkSheetRow {
  return {
    id: String(p.student_id),
    studentName: p.student?.full_name ?? "",
    matricule: p.student?.matricule ?? null,
    className: p.class?.name ?? "",
    mark: toMark(p.mark),
  };
}

/** Build the `{subject_id, exam_id, class_id?}` request body from a selection. */
function toBody(selection: MarkSheetSelection): Record<string, unknown> {
  return {
    subject_id: selection.subjectId,
    exam_id: selection.examId,
    ...(selection.classId ? { class_id: selection.classId } : {}),
  };
}

export const httpMarkSheetsService: MarkSheetsService = {
  async getOptions(): Promise<MarkSheetOptions> {
    const data = await api.get<IndexPayload>("/dashboard/mark-sheets");
    return {
      subjects: (data.subjects ?? []).map((s) => ({
        id: String(s.id),
        name: s.name,
        code: s.code ?? "",
      })),
      exams: (data.exams ?? []).map((e) => ({
        id: String(e.id),
        name: e.name,
        term: Number(e.term ?? 0),
      })),
      classes: (data.classes ?? []).map((c) => ({ id: String(c.id), name: c.name })),
    };
  },

  async preview(selection): Promise<MarkSheetPreview> {
    const data = await api.post<PreviewPayload>(
      "/dashboard/mark-sheets/preview",
      toBody(selection),
    );
    return {
      subject: {
        id: String(data.subject.id),
        name: data.subject.name,
        code: data.subject.code ?? "",
      },
      exam: { id: String(data.exam.id), name: data.exam.name },
      class: data.class ? { id: String(data.class.id), name: data.class.name } : null,
      rows: (data.marks ?? []).map(mapRow),
    };
  },

  async download(selection): Promise<void> {
    // Generate first so the file exists on disk, then stream it.
    const { download_url } = await api.post<{ download_url?: string | null }>(
      "/dashboard/mark-sheets/generate",
      toBody(selection),
    );

    if (selection.classId) {
      // Single-class PDF: auth-scoped download route yields the proper filename.
      await downloadFile(
        `/dashboard/mark-sheets/download/${selection.subjectId}/${selection.examId}/${selection.classId}`,
        { fallbackName: "mark-sheet.pdf" },
      );
      return;
    }

    // No class chosen → the backend produced a ZIP; open its public URL.
    if (download_url && typeof window !== "undefined") {
      window.open(download_url, "_blank", "noopener,noreferrer");
    }
  },
};
