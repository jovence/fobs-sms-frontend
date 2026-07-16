import { api } from "@/lib/api-client";
import { ApiError, type Role, type Session, type User } from "@/types";
import type { AuthService } from "./auth.service";

/**
 * Live implementation of {@link AuthService} against the Laravel backend
 * (`/api/dashboard/{register,login,logout,user}`, owner + admin, Sanctum).
 * Maps the backend's `UserResource` (snake_case, numeric `id`) onto the UI's
 * camelCase {@link Session}. See `features/schools/api/schools.http.ts` for the pattern.
 */

/** Shape of the backend `UserResource` (snake_case, `id` numeric, role a raw string). */
interface UserPayload {
  id: number | string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  email_verified_at: string | null;
  created_at: string | null;
}

/** Backend login/register payload: `{ token, user }` (no schools/memberships are returned). */
interface AuthPayload {
  token: string;
  user: UserPayload;
}

/** Dashboard sign-in only admits `owner`/`admin`; fall back to `owner` for any unknown value. */
function toRole(value: string): Role {
  return value === "owner" || value === "admin" || value === "teacher" || value === "parent"
    ? value
    : "owner";
}

function mapUser(p: UserPayload): User {
  return {
    id: String(p.id),
    name: p.name,
    email: p.email,
    phone: p.phone,
    role: toRole(p.role),
    emailVerifiedAt: p.email_verified_at,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/**
 * The backend `{ token, user }` payload carries no schools/memberships, so `memberships`
 * is `[]` and `activeSchoolId` is `null` — the UI hydrates tenancy separately (via the
 * schools service) after sign-in. NOTE: this is an assumed shape; if the auth payload later
 * grows a `schools` array, extend this mapper to derive memberships from it.
 */
function mapSession(p: AuthPayload): Session {
  return {
    user: mapUser(p.user),
    token: p.token,
    memberships: [],
    activeSchoolId: null,
  };
}

export const httpAuthService: AuthService = {
  async login({ email, password }) {
    const payload = await api.post<AuthPayload>("/dashboard/login", {
      email: email.trim().toLowerCase(),
      password,
    });
    return mapSession(payload);
  },

  async register(input) {
    const payload = await api.post<AuthPayload>("/dashboard/register", {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() ?? null,
      password: input.password,
      // Laravel's `confirmed` rule expects the `<field>_confirmation` sibling.
      password_confirmation: input.confirmPassword,
    });
    return mapSession(payload);
  },

  async forgotPassword() {
    // NOTE: no password-reset endpoint exists in the dashboard route list yet.
    throw new ApiError("Not available yet.", "unknown", 501);
  },

  async logout() {
    // Bearer token is attached automatically by the api-client from the auth store.
    await api.post<null>("/dashboard/logout");
  },
};
