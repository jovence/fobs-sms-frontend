import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function teacherSchema(t: T) {
  return z.object({
    name: z.string().min(2, t("minLength", { min: 2 })),
    email: z.string().min(1, t("required")).email(t("email")),
    phone: z.string().min(6, t("phone")),
    specialization: z.string().min(2, t("minLength", { min: 2 })),
    qualifications: z.string().min(1, t("required")),
    experienceYears: z
      .number({ message: t("required") })
      .min(0)
      .max(60),
  });
}

export type TeacherValues = z.infer<ReturnType<typeof teacherSchema>>;
