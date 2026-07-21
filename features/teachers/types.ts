export type TeacherStatus = "active" | "pending";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  status: TeacherStatus;
  subjectsCount: number;
  classesCount: number;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface TeacherInput {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
}

/** Lightweight {id,name} teacher entry for pickers (class master, subject class teacher). */
export interface TeacherOption {
  id: string;
  name: string;
}

export interface TeacherQuery {
  page: number;
  perPage: number;
  search?: string;
  status?: TeacherStatus;
  sortBy?: keyof Teacher;
  sortDir?: "asc" | "desc";
}

/** A subject as shown in the profile / assignment grids (backend `SubjectResource`). */
export interface AssignedSubject {
  id: string;
  name: string;
  code: string | null;
  level: string | null;
  series: string | null;
}

/** A class attached to a teacher, with its student headcount (backend `SchoolClassResource`). */
export interface AssignedClass {
  id: string;
  name: string;
  level: string | null;
  academicYear: string | null;
  section: string | null;
  studentCount: number;
}

/** One row of the "Detailed Teaching Assignments" table: a class → the subjects taught in it. */
export interface TeachingAssignment {
  classId: string;
  className: string;
  studentCount: number;
  subjects: AssignedSubject[];
}

/** Full teacher profile aggregated from the `show` endpoint (+ assigned-subjects form). */
export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  bio: string;
  avatarUrl: string | null;
  status: TeacherStatus;
  joinedAt: string;
  approvedAt: string | null;
  totalSubjects: number;
  totalClasses: number;
  totalAssignments: number;
  totalStudents: number;
  subjects: AssignedSubject[];
  classes: AssignedClass[];
  assignments: TeachingAssignment[];
}

/** Data for the assign-subjects page: current selection + the full school subject catalog. */
export interface AssignSubjectsForm {
  teacherName: string;
  assignedSubjectIds: string[];
  availableSubjects: AssignedSubject[];
}

/** A class option offered under a subject on the assign-classes page. */
export interface AssignClassOption {
  id: string;
  name: string;
  level: string | null;
  academicYear: string | null;
}

/** Available classes grouped by one of the teacher's subjects, with the currently-checked ids. */
export interface AssignClassSubjectGroup {
  subjectId: string;
  subjectName: string;
  classes: AssignClassOption[];
  assignedClassIds: string[];
}

/** Data for the assign-classes page. */
export interface AssignClassesForm {
  teacherName: string;
  assignedClasses: AssignedClass[];
  subjects: AssignClassSubjectGroup[];
}

/** Payload sent to sync a teacher's teaching assignments: per subject, the chosen class ids. */
export interface ClassAssignmentInput {
  subjectId: string;
  classIds: string[];
}
