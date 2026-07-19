import { ApiError } from "@/types";

export type MutationErrorKey =
  "network" | "notFound" | "forbidden" | "conflict" | "validation" | "generic";

/**
 * Maps a failed mutation to a key in the `common.errors` i18n namespace so the
 * global error toast shows a message in the user's language, instead of echoing
 * the backend's raw (English) error string into a French session.
 */
export function mutationErrorKey(error: unknown): MutationErrorKey {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "network":
        return "network";
      case "not_found":
        return "notFound";
      case "unauthorized":
      case "forbidden":
        return "forbidden";
      case "validation":
        return "validation";
    }
    if (error.status === 409) return "conflict";
  }
  return "generic";
}
