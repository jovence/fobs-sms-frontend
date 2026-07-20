import type { Session } from "@/types";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "../types";
import { httpAuthService } from "./auth.http";

/**
 * The auth contract. Screens depend on this interface — never on how it's fulfilled.
 * Backed live by {@link httpAuthService} (Laravel `/api/dashboard/{login,register,logout,user}`).
 */
export interface AuthService {
  login(input: LoginInput): Promise<Session>;
  register(input: RegisterInput): Promise<Session>;
  forgotPassword(input: ForgotPasswordInput): Promise<{ sent: true }>;
  logout(): Promise<void>;
}

export const authService: AuthService = httpAuthService;
