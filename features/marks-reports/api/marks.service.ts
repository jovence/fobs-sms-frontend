import type {
  EntrySelection,
  EntryStudent,
  ReportDownloadParams,
  ReportGenerateResult,
  ReportIndex,
  ReportMode,
  ReportParams,
  ReportPreview,
  SaveMarksInput,
} from "../types";
import { httpMarksService } from "./marks.http";

export interface MarksService {
  /** The roster (with any previously saved marks) for a Class + Subject + Exam. */
  listEntryRoster(selection: EntrySelection): Promise<EntryStudent[]>;
  /** Persist entered marks for a Class + Subject + Exam. */
  saveMarks(input: SaveMarksInput): Promise<void>;

  // ---- Report cards (Term / Sequence / Annual) ----
  /** Filter metadata for the report cards screen (classes + academic years). */
  reportIndex(): Promise<ReportIndex>;
  /** Preview the students in scope, flagging those missing marks. */
  previewReport(mode: ReportMode, params: ReportParams): Promise<ReportPreview>;
  /** Kick off PDF generation for every student in scope. */
  generateReport(mode: ReportMode, params: ReportParams): Promise<ReportGenerateResult>;
  /** Download the consolidated ZIP / PDF of all report cards in scope. */
  downloadAllReports(mode: ReportMode, params: ReportDownloadParams): Promise<void>;
  /** Download a single student's report card PDF. */
  downloadStudentReport(mode: ReportMode, params: ReportDownloadParams): Promise<void>;
}

export const marksService: MarksService = httpMarksService;
