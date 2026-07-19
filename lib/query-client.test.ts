import { afterEach, describe, expect, it, vi } from "vitest";
import { MutationObserver } from "@tanstack/react-query";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from "sonner";
import { makeQueryClient } from "./query-client";

afterEach(() => {
  vi.clearAllMocks();
});

describe("makeQueryClient global mutation error handling", () => {
  it("shows an error toast when a mutation fails (no more silent failures)", async () => {
    const qc = makeQueryClient();
    const observer = new MutationObserver(qc, {
      mutationFn: () => Promise.reject(new Error("Approve failed")),
    });

    await observer.mutate().catch(() => {});

    expect(toast.error).toHaveBeenCalledWith("Approve failed");
  });

  it("stays silent when the mutation opts out via meta.suppressErrorToast", async () => {
    const qc = makeQueryClient();
    const observer = new MutationObserver(qc, {
      mutationFn: () => Promise.reject(new Error("handled locally")),
      meta: { suppressErrorToast: true },
    });

    await observer.mutate().catch(() => {});

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("falls back to a generic message when the error has no message", async () => {
    const qc = makeQueryClient();
    const observer = new MutationObserver(qc, {
      mutationFn: () => Promise.reject(new Error("")),
    });

    await observer.mutate().catch(() => {});

    expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.");
  });
});
