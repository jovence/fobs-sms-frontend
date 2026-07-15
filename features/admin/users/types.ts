import type { Role } from "@/types";

export type { Role };

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  joinedAt: string;
}

export interface AdminUserQuery {
  page: number;
  perPage: number;
  search?: string;
  role?: Role;
  sortBy?: keyof AdminUser;
  sortDir?: "asc" | "desc";
}
