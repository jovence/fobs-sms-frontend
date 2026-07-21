import { describe, expect, it } from "vitest";
import { ApiError } from "@/types";
import { mutationErrorKey } from "./mutation-error";

describe("mutationErrorKey", () => {
  it("maps known ApiError codes to their namespace key", () => {
    expect(mutationErrorKey(new ApiError("offline", "network", 0))).toBe("network");
    expect(mutationErrorKey(new ApiError("gone", "not_found", 404))).toBe("notFound");
    expect(mutationErrorKey(new ApiError("nope", "forbidden", 403))).toBe("forbidden");
    expect(mutationErrorKey(new ApiError("nope", "unauthorized", 401))).toBe("forbidden");
    expect(mutationErrorKey(new ApiError("bad", "validation", 422))).toBe("validation");
  });

  it("maps a 409 to conflict", () => {
    expect(mutationErrorKey(new ApiError("dup", "unknown", 409))).toBe("conflict");
  });

  it("falls back to generic for unknown codes and non-ApiErrors", () => {
    expect(mutationErrorKey(new ApiError("boom", "unknown", 500))).toBe("generic");
    expect(mutationErrorKey(new Error("weird"))).toBe("generic");
    expect(mutationErrorKey(undefined)).toBe("generic");
  });
});
