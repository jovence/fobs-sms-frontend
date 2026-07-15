import { z } from "zod";

type T = (key: string, values?: Record<string, string | number>) => string;

export function appUpdateSchema(t: T) {
  return z.object({
    version: z.string().min(1, t("required")),
    message: z.string().max(500).optional().or(z.literal("")),
    downloadUrl: z.union([z.string().url(t("required")), z.literal("")]).optional(),
  });
}

export type AppUpdateValues = z.infer<ReturnType<typeof appUpdateSchema>>;
