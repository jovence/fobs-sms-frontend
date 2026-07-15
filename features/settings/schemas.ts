import { z } from "zod";

/**
 * Schema factories take the next-intl translator so validation messages are
 * localised. Keys live under the `validation` namespace.
 */
type T = (key: string, values?: Record<string, string | number>) => string;

export function profileSchema(t: T) {
  return z.object({
    name: z.string().min(2, t("minLength", { min: 2 })),
    email: z.string().min(1, t("required")).email(t("email")),
  });
}

export function passwordSchema(t: T) {
  return z
    .object({
      currentPassword: z.string().min(1, t("required")),
      newPassword: z.string().min(8, t("minLength", { min: 8 })),
      confirmPassword: z.string().min(1, t("required")),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t("passwordMatch"),
      path: ["confirmPassword"],
    });
}

export type ProfileValues = z.infer<ReturnType<typeof profileSchema>>;
export type PasswordValues = z.infer<ReturnType<typeof passwordSchema>>;
