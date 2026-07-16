"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchools } from "@/features/schools/hooks";
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

/**
 * The active school (tenancy). Single source of truth = the schools list (same source as
 * the Schools page), with the selected id kept in the auth store. Auto-selects the first
 * school when none is chosen or the chosen one no longer exists, so switching works on any
 * account — including a freshly-registered one — and a newly-created school shows up here.
 */
export function useActiveSchool() {
  const { data: schools } = useSchools();
  const activeId = useAuthStore((s) => s.session?.activeSchoolId ?? null);
  const setActiveSchool = useAuthStore((s) => s.setActiveSchool);

  useEffect(() => {
    if (!schools?.length) return;
    if (!activeId || !schools.some((x) => x.id === activeId)) {
      setActiveSchool(schools[0].id);
    }
  }, [schools, activeId, setActiveSchool]);

  if (!schools?.length) return null;
  return schools.find((x) => x.id === activeId) ?? schools[0];
}

export function useAuthHydrated() {
  return useAuthStore((s) => s.hydrated);
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (session) => {
      qc.clear(); // drop any previous account's cached data (schools, lists…)
      setSession(session);
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (session) => {
      qc.clear();
      setSession(session);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authService.forgotPassword(input),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearSession();
      qc.clear();
    },
  });
}
