import { z } from "zod";
import { MARK_MAX } from "./types";

type T = (key: string, values?: Record<string, string | number>) => string;

/**
 * A single mark value: a number between 0 and 20 (MINESEC scale). Marks are
 * validated with `z.number()` (never `z.coerce.number()`); the caller parses
 * the raw input to a number first.
 */
export function markValueSchema(t: T) {
  return z
    .number({ message: t("range", { max: MARK_MAX }) })
    .min(0, t("range", { max: MARK_MAX }))
    .max(MARK_MAX, t("range", { max: MARK_MAX }));
}

/** Parse a raw input string to a validated mark, or return an error message. */
export function validateMark(
  raw: string,
  t: T,
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  const parsed = Number(trimmed);
  const result = markValueSchema(t).safeParse(
    trimmed === "" || Number.isNaN(parsed) ? NaN : parsed,
  );
  if (result.success) return { ok: true, value: result.data };
  return { ok: false, error: result.error.issues[0]?.message ?? t("range", { max: MARK_MAX }) };
}
