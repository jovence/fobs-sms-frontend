import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function examSchema(t: T) {
  return z.object({
    name: z.string().min(2, t("minLength", { min: 2 })),
    term: z.enum(["First", "Second", "Third"], { message: t("required") }),
    sequence: z
      .number({ message: t("required") })
      .int(t("required"))
      .min(1, t("required"))
      .max(6, t("required")),
    published: z.boolean(),
    markEntryAllowed: z.boolean(),
  });
}

export type ExamValues = z.infer<ReturnType<typeof examSchema>>;
