import { api } from "@/lib/api-client";
import type { ApiMeta, Paginated, Role } from "@/types";
import type { AdminUser, AdminUserQuery } from "../types";
import type { AdminUsersService } from "./admin-users.service";

/**
 * Live implementation of {@link AdminUsersService} against the Laravel backend
 * (`/api/dashboard/admin/users`, super-admin). Maps the snake_case `UserResource`
 * payload onto the UI's camelCase {@link AdminUser} type.
 */

/** Shape of the backend `UserResource` (snake_case, `id` numeric). */
interface UserPayload {
  id: number | string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  email_verified_at?: string | null;
  created_at: string | null;
  updated_at?: string | null;
  schools_count?: number;
  students_count?: number;
}

function mapUser(p: UserPayload): AdminUser {
  return {
    id: String(p.id),
    name: p.name,
    email: p.email,
    // Frontend `phone` is a required string; the backend may send null.
    phone: p.phone ?? "",
    role: p.role as Role,
    joinedAt: p.created_at ?? "",
  };
}

/**
 * Map a frontend `sortBy` (a key of {@link AdminUser}) onto a backend-allowed sort column.
 * The backend accepts only name/email/role/created_at/schools_count; unsupported keys
 * (id, phone) are dropped so the backend falls back to its `created_at` default.
 */
function toSortColumn(sortBy: keyof AdminUser): string | null {
  switch (sortBy) {
    case "joinedAt":
      return "created_at";
    case "name":
    case "email":
    case "role":
      return sortBy;
    default:
      return null;
  }
}

/** Convert the api-client's snake_case list meta onto the UI's {@link Paginated} shape. */
function toPaginated(items: AdminUser[], meta: ApiMeta | null, query: AdminUserQuery): Paginated<AdminUser> {
  const total = meta?.total ?? items.length;
  const perPage = meta?.per_page ?? query.perPage;
  return {
    items,
    page: meta?.current_page ?? query.page,
    perPage,
    total,
    totalPages: meta?.last_page ?? (Math.ceil(total / perPage) || 1),
  };
}

export const httpAdminUsersService: AdminUsersService = {
  async list(query) {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    // NOTE: the backend index hardcodes `paginate(20)` and ignores per_page; sent for forward-compat.
    params.set("per_page", String(query.perPage));
    if (query.search) params.set("search", query.search);
    if (query.role) params.set("role", query.role);
    if (query.sortBy) {
      const column = toSortColumn(query.sortBy);
      if (column) {
        params.set("sort", column);
        params.set("direction", query.sortDir ?? "asc");
      }
    }
    const { data, meta } = await api.list<UserPayload>(`/dashboard/admin/users?${params.toString()}`);
    return toPaginated(data.map(mapUser), meta, query);
  },
  async remove(id) {
    await api.delete<null>(`/dashboard/admin/users/${id}`);
  },
  async bulkRemove(ids) {
    // Backend expects `user_ids` (validated `integer|exists:users,id`); numeric-string ids coerce fine.
    await api.post<{ deleted: number; failed: number; skipped: number }>(
      "/dashboard/admin/users/bulk-delete",
      { user_ids: ids },
    );
  },
};
