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
  const qc = useQueryClient();

  useEffect(() => {
    if (!schools) return; // still loading — don't touch the selection
    // Reconcile the selected school with the schools this account actually owns:
    // none → clear (so a no-school account shows nothing, not a stale demo school);
    // invalid/unset → pick the first. Then drop the scoped list caches so they refetch.
    let nextId: string | null = activeId;
    if (schools.length === 0) nextId = null;
    else if (!activeId || !schools.some((x) => x.id === activeId)) nextId = schools[0].id;

    if (nextId !== activeId) {
      setActiveSchool(nextId);
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "schools" });
    }
  }, [schools, activeId, setActiveSchool, qc]);

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
    // The form shows its own translated inline error; opt out of the global toast
    // so a failure isn't also surfaced as a second, untranslated toast.
    meta: { suppressErrorToast: true },
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
    // The form shows its own translated inline error; opt out of the global toast.
    meta: { suppressErrorToast: true },
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
