/**
 * Core domain types — derived from the FOBS SMS backend entities.
 * These are the shared contracts the UI and (later) the real API both speak.
 */

export type Role = "owner" | "admin" | "teacher" | "parent";

export type SubscriptionTier = "free" | "basic" | "pro";

export type SchoolSection = "english" | "french";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  emailVerifiedAt?: string | null;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  acronym: string;
  code: string;
  ownerId: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  academicYear: string;
  logoUrl?: string | null;
  subscription: SubscriptionTier;
  isDemo: boolean;
  studentCount?: number;
  teacherCount?: number;
  classCount?: number;
  createdAt: string;
}

/** A school the current user belongs to, with their role in it (tenancy). */
export interface SchoolMembership {
  school: School;
  role: Role;
  isActive: boolean;
}

export interface Session {
  user: User;
  token: string;
  memberships: SchoolMembership[];
  activeSchoolId: string | null;
}

/** Standard envelope every service returns — mirrors the backend's payload/status shape. */
export interface ApiResult<T> {
  data: T;
  message?: string;
}

/** Paginated list envelope. */
export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/** A typed error the UI can branch on (invalid credentials, validation, etc.). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "invalid_credentials"
      | "email_taken"
      | "unauthorized"
      | "forbidden"
      | "not_found"
      | "validation"
      | "network"
      | "unknown" = "unknown",
    public readonly status = 400,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
