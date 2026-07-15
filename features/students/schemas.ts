import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function studentSchema(t: T) {
  return z.object({
    fullName: z.string().min(2, t("minLength", { min: 2 })),
    matricule: z.string().optional(),
    gender: z.enum(["Male", "Female"], { message: t("required") }),
    dateOfBirth: z
      .string()
      .min(1, t("required"))
      .refine((v) => !Number.isNaN(Date.parse(v)) && new Date(v) < new Date(), {
        message: t("required"),
      }),
    placeOfBirth: z.string().min(2, t("minLength", { min: 2 })),
    classId: z.string().min(1, t("required")),
    guardianName: z.string().optional(),
    isRepeater: z.boolean().optional(),
    status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
  });
}

export type StudentValues = z.infer<ReturnType<typeof studentSchema>>;
