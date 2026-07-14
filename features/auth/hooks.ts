"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "./api/auth.service";
import { useAuthStore } from "./store";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./types";

/** Current session + tenancy selectors. */
export function useSession() {
  return useAuthStore((s) => s.session);
}

export function useCurrentUser() {
  return useAuthStore((s) => s.session?.user ?? null);
}

export function useActiveSchool() {
  return useAuthStore((s) => {
    const session = s.session;
    if (!session) return null;
    return (
      session.memberships.find((m) => m.school.id === session.activeSchoolId) ?? null
    );
  });
}

export function useAuthHydrated() {
  return useAuthStore((s) => s.hydrated);
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (session) => setSession(session),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (session) => setSession(session),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authService.forgotPassword(input),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => clearSession(),
  });
}
