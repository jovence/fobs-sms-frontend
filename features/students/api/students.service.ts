import type { Paginated } from "@/types";
import type {
  Student,
  StudentDetail,
  StudentImportConfirm,
  StudentImportInput,
  StudentImportPreview,
  StudentInput,
  StudentQuery,
  StudentStats,
} from "../types";
import { httpStudentsService } from "./students.http";

export interface StudentsService {
  list(query: StudentQuery): Promise<Paginated<Student>>;
  get(id: string): Promise<StudentDetail>;
  stats(): Promise<StudentStats>;
  create(input: StudentInput): Promise<Student>;
  update(id: string, input: StudentInput): Promise<Student>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  updateStatus(id: string, status: Student["status"]): Promise<Student>;
  /** Parse a class-list file into a reviewable preview (Gemini on the live backend). */
  importParse(input: StudentImportInput): Promise<StudentImportPreview>;
  /** Persist the reviewed, extracted students into the target class. */
  importConfirm(input: StudentImportConfirm): Promise<void>;
}

export const studentsService: StudentsService = httpStudentsService;
