import type { Paginated } from "@/types";
import type { Exam, ExamDashboard, ExamInput, ExamQuery } from "../types";
import { httpExamsService } from "./exams.http";

export interface ExamsService {
  list(query: ExamQuery): Promise<Paginated<Exam>>;
  /** Lightweight {id,name} list for dropdowns, scoped to the active school. */
  options(): Promise<Array<{ id: string; name: string }>>;
  get(id: string): Promise<Exam>;
  create(input: ExamInput): Promise<Exam>;
  update(id: string, input: ExamInput): Promise<Exam>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  /** Exam detail + analytics for the dashboard page. */
  getDashboard(id: string): Promise<ExamDashboard>;
  /** Flip the publication status; returns the updated exam. */
  togglePublish(id: string): Promise<Exam>;
  /** Flip whether mark entry is open; returns the updated exam. */
  toggleMarkFill(id: string): Promise<Exam>;
}

export const examsService: ExamsService = httpExamsService;
