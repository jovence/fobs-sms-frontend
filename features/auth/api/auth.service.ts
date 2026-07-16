import { pickService } from "@/lib/api-client";
import { withLatency } from "@/lib/mock";
import { ApiError, type Session } from "@/types";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "../types";
import { mockAccounts } from "../mock-data";
import { httpAuthService } from "./auth.http";

/**
 * The auth contract. The mock and the (future) live implementation both satisfy it,
 * so screens depend on this interface — never on how it's fulfilled.
 */
export interface AuthService {
  login(input: LoginInput): Promise<Session>;
  register(input: RegisterInput): Promise<Session>;
  forgotPassword(input: ForgotPasswordInput): Promise<{ sent: true }>;
  logout(): Promise<void>;
}

function makeToken(userId: string): string {
  return `mock.${userId}.${Math.abs(hash(userId + Date.now().toString())).toString(36)}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

const mockAuthService: AuthService = {
  async login({ email, password }) {
    const account = mockAccounts.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account || account.password !== password) {
      await withLatency(null, 500);
      throw new ApiError("Invalid credentials", "invalid_credentials", 401);
    }
    return withLatency({
      user: account.user,
      token: makeToken(account.user.id),
      memberships: account.memberships,
      activeSchoolId: account.memberships[0]?.school.id ?? null,
    });
  },

  async register(input) {
    const exists = mockAccounts.some(
      (a) => a.user.email.toLowerCase() === input.email.trim().toLowerCase(),
    );
    if (exists) {
      await withLatency(null, 500);
      throw new ApiError("Email already taken", "email_taken", 422, {
        email: "email_taken",
      });
    }
    const session: Session = {
      user: {
        id: `usr_${hash(input.email).toString(36)}`,
        name: input.name,
        email: input.email.trim().toLowerCase(),
        phone: input.phone ?? null,
        role: "owner",
        emailVerifiedAt: null,
        createdAt: new Date(0).toISOString(),
      },
      token: makeToken(input.email),
      memberships: [],
      activeSchoolId: null,
    };
    return withLatency(session, 700);
  },

  async forgotPassword() {
    // Always succeeds (no account enumeration) — mirrors good security practice.
    return withLatency({ sent: true } as const, 600);
  },

  async logout() {
    return withLatency(undefined, 200);
  },
};

// The UI depends only on this export; `pickService` swaps mock↔live via NEXT_PUBLIC_API_MODE.
export const authService: AuthService = pickService(mockAuthService, httpAuthService);
