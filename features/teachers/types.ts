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

export interface TeacherQuery {
  page: number;
  perPage: number;
  search?: string;
  status?: TeacherStatus;
  sortBy?: keyof Teacher;
  sortDir?: "asc" | "desc";
}
