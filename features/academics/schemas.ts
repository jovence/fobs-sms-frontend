import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function classSchema(t: T) {
  return z.object({
    name: z.string().min(1, t("required")),
    level: z.enum(["lower", "upper"], { message: t("required") }),
    section: z.enum(["english", "french"], { message: t("required") }),
    // Teacher id backing the class master; empty string = unassigned.
    classMasterId: z.string().optional(),
  });
}

/** One class-assignment row inside the subject form. */
const subjectClassSchema = z.object({
  classId: z.string(),
  assigned: z.boolean(),
  // Inputs use `valueAsNumber`, so the form already supplies numbers (NaN when cleared).
  coefficient: z.number().min(0.5).max(10),
  minWeeklyHours: z.number().int().min(1).max(20),
  teacherId: z.string().nullable(),
});

export function subjectSchema(t: T) {
  return z.object({
    name: z.string().min(2, t("minLength", { min: 2 })),
    code: z.string().min(2, t("minLength", { min: 2 })).max(8),
    series: z.enum(["science", "art", "both"], { message: t("required") }),
    classes: z.array(subjectClassSchema),
  });
}

export type ClassValues = z.infer<ReturnType<typeof classSchema>>;
export type SubjectValues = z.infer<ReturnType<typeof subjectSchema>>;
