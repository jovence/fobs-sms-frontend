import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function schoolSchema(t: T) {
  return z.object({
    name: z.string().min(3, t("minLength", { min: 3 })),
    acronym: z.string().min(2, t("minLength", { min: 2 })).max(6),
    email: z.union([z.string().email(t("email")), z.literal("")]).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  });
}

export type SchoolValues = z.infer<ReturnType<typeof schoolSchema>>;
