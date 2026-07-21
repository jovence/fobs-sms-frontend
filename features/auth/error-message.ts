import { ApiError } from "@/types";

/**
 * Maps a failed auth request to a message key in the `auth` i18n namespace.
 * Keeps the "wrong credentials" vs "email already taken" cases at the call
 * site (they are form-specific); this covers the shared fallback so a network
 * or server failure is never mislabelled as a credentials/email problem.
 */
export function authErrorMessageKey(err: unknown): "networkError" | "genericError" {
  if (err instanceof ApiError && err.code === "network") return "networkError";
  return "genericError";
}
