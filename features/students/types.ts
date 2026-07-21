export type Gender = "Male" | "Female";
export type RegistrationStatus = "Pending" | "Approved" | "Rejected";

export interface Student {
  id: string;
  matricule: string | null;
  fullName: string;
  gender: Gender;
  dateOfBirth: string; // ISO
  placeOfBirth: string;
  classId: string;
  className: string;
  status: RegistrationStatus;
  guardianName: string | null;
  photoUrl: string | null;
  isRepeater: boolean;
  createdAt: string;
}

export interface StudentInput {
  fullName: string;
  matricule?: string;
  gender: Gender;
  dateOfBirth: string;
  placeOfBirth: string;
  classId: string;
  image?: File | null;
  guardianName?: string;
  isRepeater?: boolean;
  status?: RegistrationStatus;
}

export interface StudentQuery {
  page: number;
  perPage: number;
  search?: string;
  classId?: string;
  status?: RegistrationStatus;
  sortBy?: keyof Student;
  sortDir?: "asc" | "desc";
}

export interface ClassOption {
  id: string;
  name: string;
}

/** Headline student counts for the stat cards (GET /dashboard/students/stats). */
export interface StudentStats {
  total: number;
  active: number;
  pending: number;
  male: number;
  female: number;
}

/**
 * Richer single-student view backing the detail page (GET /dashboard/students/{id} →
 * StudentResource). Extends {@link Student} with fields the show endpoint exposes but the
 * list rows don't, so the base `Student` shape stays assignable to it.
 */
export interface StudentDetail extends Student {
  code?: string | null;
  guardianContact?: string | null;
  guardianEmail?: string | null;
}

/**
 * A student parsed by the Gemini AI import, awaiting confirmation (camelCase for the UI).
 * Mirrors one entry of the backend's `studentData` array.
 */
export interface ParsedImportStudent {
  matricule: string | null;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: Gender;
  className: string | null;
}

/** Request for the AI import parse step: a class-list file plus the target class. */
export interface StudentImportInput {
  file: File;
  classId: string;
}

/** Preview returned by the parse step: extracted rows plus the target class to import into. */
export interface StudentImportPreview {
  students: ParsedImportStudent[];
  classId: string;
}

/** Payload for the confirm step: reviewed rows persisted into the target class. */
export interface StudentImportConfirm {
  students: ParsedImportStudent[];
  classId: string;
}
