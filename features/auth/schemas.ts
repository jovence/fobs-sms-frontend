import { z } from "zod";

/**
 * Schema factories take the next-intl translator so validation messages are localised.
 * Keys live under the `validation` namespace.
 */
type T = (key: string, values?: Record<string, string | number>) => string;

export function loginSchema(t: T) {
  return z.object({
    email: z.string().min(1, t("required")).email(t("email")),
    password: z.string().min(1, t("required")),
    remember: z.boolean().optional(),
  });
}

export function registerSchema(t: T) {
  return z
    .object({
      name: z.string().min(2, t("minLength", { min: 2 })),
      email: z.string().min(1, t("required")).email(t("email")),
      phone: z.string().optional(),
      password: z.string().min(8, t("minLength", { min: 8 })),
      confirmPassword: z.string().min(1, t("required")),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t("passwordMatch"),
      path: ["confirmPassword"],
    });
}

export function forgotPasswordSchema(t: T) {
  return z.object({
    email: z.string().min(1, t("required")).email(t("email")),
  });
}

export type LoginValues = z.infer<ReturnType<typeof loginSchema>>;
export type RegisterValues = z.infer<ReturnType<typeof registerSchema>>;
export type ForgotPasswordValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;
