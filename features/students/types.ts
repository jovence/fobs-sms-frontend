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
