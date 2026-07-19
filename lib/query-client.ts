import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Single place to tune server-state behaviour for the whole app. */
export function makeQueryClient() {
  return new QueryClient({
    // Surface every failed mutation to the user by default so that no write
    // action (approve, delete, status/tier change, save…) can fail silently.
    // A mutation that renders its own error can opt out with
    // meta: { suppressErrorToast: true }.
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.suppressErrorToast) return;

        const message =
          error instanceof Error && error.message
            ? error.message
            : "Something went wrong. Please try again.";

        // Error toasts do not auto-dismiss (the Toaster shows a close button), so a
        // slow reader isn't left with a failed write they never saw.
        toast.error(message, { duration: Infinity });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
