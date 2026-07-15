import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function parentSchema(t: T) {
  return z.object({
    name: z.string().min(2, t("minLength", { min: 2 })),
    email: z.string().min(1, t("required")).email(t("email")),
    phone: z.string().min(6, t("phone")),
    occupation: z.string().min(2, t("minLength", { min: 2 })),
    address: z.string().min(4, t("minLength", { min: 4 })),
  });
}

export type ParentValues = z.infer<ReturnType<typeof parentSchema>>;
