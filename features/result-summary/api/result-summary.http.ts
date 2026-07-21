import { api, downloadFile } from "@/lib/api-client";
import {
  resultSummaryExamLabel,
  type GenerateResultSummaryInput,
  type ResultSummaryOptions,
} from "../types";
import type { ResultSummaryService } from "./result-summary.service";

/**
 * Live implementation of {@link ResultSummaryService} against the Laravel backend
 * (`/api/dashboard/result-summary`, tenancy via `X-School-Id`).
 *
 * The index action returns `{ classes, exams }` as raw Eloquent models (see
 * GetResultSummaryIndexAction / ResultSummaryService::indexData), so we read the model
 * attributes directly and map them onto the UI option types. Generate posts `{ class_id,
 * exam_id }` and streams the landscape PDF via `downloadFile` (which throws `ApiError` with
 * the 422 message on a rejected selection).
 */

/** Raw `SchoolClass` model attributes surfaced by the index. */
interface ClassModelPayload {
  id: number | string;
  name: string | null;
}

/** Raw `Exam` model attributes surfaced by the index. */
interface ExamModelPayload {
  id: number | string;
  name: string | null;
  term: string | null;
  academic_year: string | null;
  sequence: number | null;
}

interface IndexPayload {
  classes: ClassModelPayload[];
  exams: ExamModelPayload[];
}

function mapClass(p: ClassModelPayload) {
  return { id: String(p.id), name: p.name ?? "—" };
}

function mapExam(p: ExamModelPayload) {
  const name = p.name ?? "—";
  const term = p.term ?? null;
  const academicYear = p.academic_year ?? null;
  const sequence = p.sequence ?? null;
  return {
    id: String(p.id),
    name,
    term,
    academicYear,
    sequence,
    label: resultSummaryExamLabel({ name, sequence, term, academicYear }),
  };
}

export const httpResultSummaryService: ResultSummaryService = {
  async options(): Promise<ResultSummaryOptions> {
    const data = await api.get<IndexPayload>("/dashboard/result-summary");
    return {
      classes: (data.classes ?? []).map(mapClass),
      exams: (data.exams ?? []).map(mapExam),
    };
  },

  async generate({ classId, examId }: GenerateResultSummaryInput): Promise<void> {
    await downloadFile("/dashboard/result-summary/generate", {
      method: "POST",
      body: { class_id: classId, exam_id: examId },
      fallbackName: "result-summary.pdf",
    });
  },
};
