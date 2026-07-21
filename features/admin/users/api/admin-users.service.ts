import type { Paginated } from "@/types";
import type { AdminUser, AdminUserQuery } from "../types";
import { httpAdminUsersService } from "./admin-users.http";

export interface AdminUsersService {
  list(query: AdminUserQuery): Promise<Paginated<AdminUser>>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

export const adminUsersService: AdminUsersService = httpAdminUsersService;
