import type { GenerateResultSummaryInput, ResultSummaryOptions } from "../types";
import { httpResultSummaryService } from "./result-summary.http";

export interface ResultSummaryService {
  /** Classes + exams for the two generator dropdowns, scoped to the active school. */
  options(): Promise<ResultSummaryOptions>;
  /**
   * Generate and download the landscape roster: streams a PDF and throws
   * {@link ApiError} on a 422 (rejected class/exam selection).
   */
  generate(input: GenerateResultSummaryInput): Promise<void>;
}

export const resultSummaryService: ResultSummaryService = httpResultSummaryService;
