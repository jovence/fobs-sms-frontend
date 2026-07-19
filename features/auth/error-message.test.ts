import { describe, expect, it } from "vitest";
import { ApiError } from "@/types";
import { authErrorMessageKey } from "./error-message";

describe("authErrorMessageKey", () => {
  it("maps a network ApiError to networkError", () => {
    expect(authErrorMessageKey(new ApiError("offline", "network", 0))).toBe(
      "networkError",
    );
  });

  it("maps other ApiErrors (server/validation) to genericError", () => {
    expect(authErrorMessageKey(new ApiError("boom", "unknown", 500))).toBe(
      "genericError",
    );
    expect(authErrorMessageKey(new ApiError("bad", "validation", 422))).toBe(
      "genericError",
    );
  });

  it("maps non-ApiError values to genericError", () => {
    expect(authErrorMessageKey(new Error("weird"))).toBe("genericError");
    expect(authErrorMessageKey(undefined)).toBe("genericError");
  });
});
