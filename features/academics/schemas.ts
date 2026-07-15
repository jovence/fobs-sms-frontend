import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function classSchema(t: T) {
  return z.object({
    name: z.string().min(1, t("required")),
    level: z.enum(["lower", "upper"], { message: t("required") }),
    section: z.enum(["english", "french"], { message: t("required") }),
    classMaster: z.string().optional(),
  });
}

export function subjectSchema(t: T) {
  return z.object({
    name: z.string().min(2, t("minLength", { min: 2 })),
    code: z.string().min(2, t("minLength", { min: 2 })).max(8),
    series: z.enum(["science", "art", "both"], { message: t("required") }),
  });
}

export type ClassValues = z.infer<ReturnType<typeof classSchema>>;
export type SubjectValues = z.infer<ReturnType<typeof subjectSchema>>;
