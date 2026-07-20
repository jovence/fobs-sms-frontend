import type { Paginated } from "@/types";
import type {
  AssignClassesForm,
  AssignSubjectsForm,
  ClassAssignmentInput,
  Teacher,
  TeacherInput,
  TeacherProfile,
  TeacherQuery,
} from "../types";
import { httpTeachersService } from "./teachers.http";

export interface TeachersService {
  list(query: TeacherQuery): Promise<Paginated<Teacher>>;
  approve(id: string): Promise<Teacher>;
  update(id: string, input: TeacherInput): Promise<Teacher>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  /** Full profile: teacher + counts + assigned subjects/classes + teaching assignments. */
  get(id: string): Promise<TeacherProfile>;
  /** Data for the assign-subjects page. */
  assignSubjectsForm(id: string): Promise<AssignSubjectsForm>;
  /** Replace the teacher's subject set with `subjectIds`. */
  assignSubjects(id: string, subjectIds: string[]): Promise<void>;
  /** Remove a single subject from the teacher. */
  removeSubject(id: string, subjectId: string): Promise<void>;
  /** Data for the assign-classes page. */
  assignClassesForm(id: string): Promise<AssignClassesForm>;
  /** Replace the teacher's class/teaching assignments. */
  assignClasses(id: string, assignments: ClassAssignmentInput[]): Promise<void>;
  /** Remove a single class (all its subject assignments) from the teacher. */
  removeClass(id: string, classId: string): Promise<void>;
}

export const teachersService: TeachersService = httpTeachersService;
