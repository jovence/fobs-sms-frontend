import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

const t = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}:${JSON.stringify(values)}` : key;

describe("auth schemas", () => {
  it("rejects an invalid email", () => {
    const result = loginSchema(t).safeParse({ email: "nope", password: "x" });
    expect(result.success).toBe(false);
  });

  it("accepts valid login input", () => {
    const result = loginSchema(t).safeParse({
      email: "owner@fobs.cm",
      password: "password",
    });
    expect(result.success).toBe(true);
  });

  it("flags mismatched passwords on register", () => {
    const result = registerSchema(t).safeParse({
      name: "Amina Nkeng",
      email: "a@b.cm",
      password: "password1",
      confirmPassword: "password2",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(
        true,
      );
    }
  });
});
