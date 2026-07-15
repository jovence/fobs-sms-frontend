import { faker } from "@faker-js/faker";
import { currentAcademicYear } from "@/lib/format";
import type { Exam, Term } from "./types";

/** Cameroon rule: Term 1 = seq 1&2, Term 2 = seq 3&4, Term 3 = seq 5&6. */
export function termForSequence(sequence: number): Term {
  if (sequence <= 2) return "First";
  if (sequence <= 4) return "Second";
  return "Third";
}

const SEQUENCE_NAMES: Record<number, string> = {
  1: "First Sequence",
  2: "Second Sequence",
  3: "Third Sequence",
  4: "Fourth Sequence",
  5: "Fifth Sequence",
  6: "Sixth Sequence",
};

function priorYear(year: string, back: number): string {
  const start = Number(year.split("-")[0]) - back;
  return `${start}-${start + 1}`;
}

/** Deterministic seed dataset so mock mode is stable across reloads (~16 exams). */
function generate(): Exam[] {
  faker.seed(2026);
  const current = currentAcademicYear();
  const years = [current, priorYear(current, 1), priorYear(current, 2)];
  const rows: Exam[] = [];
  let n = 0;

  years.forEach((year, yi) => {
    const seqCount = yi === 2 ? 4 : 6; // 6 + 6 + 4 = 16 exams
    const isCurrent = yi === 0;
    for (let seq = 1; seq <= seqCount; seq++) {
      n += 1;
      // Past years are fully published; the current year publishes earlier sequences only.
      const published = !isCurrent || seq <= 3;
      // Mark entry stays open for the current year's later sequences; otherwise mostly closed.
      const markEntryAllowed =
        isCurrent && seq >= 4 ? true : faker.datatype.boolean(0.15);
      rows.push({
        id: `exm_${n.toString().padStart(3, "0")}`,
        name: SEQUENCE_NAMES[seq],
        term: termForSequence(seq),
        sequence: seq,
        academicYear: year,
        published,
        markEntryAllowed,
        createdAt: faker.date
          .recent({ days: 90 * (yi + 1), refDate: new Date() })
          .toISOString(),
      } satisfies Exam);
    }
  });

  return rows;
}

export const seedExams = generate();
