import type { MarkSheetOptions, MarkSheetPreview, MarkSheetSelection } from "../types";
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

export const markSheetsService: MarkSheetsService = httpMarkSheetsService;
