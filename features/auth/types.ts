import type { Session } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export type { Session };
