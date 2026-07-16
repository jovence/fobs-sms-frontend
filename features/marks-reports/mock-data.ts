import { faker } from "@faker-js/faker";
import { seedClasses } from "@/features/academics/mock-data";
import type {
  ClassOption,
  Decision,
  ExamOption,
  ReportRow,
  SubjectOption,
} from "./types";
import { CONDITIONAL_MARK, PASS_MARK } from "./types";

// Same demo classes as the Academics module (matching IDs) so report rows / rosters line
// up with the class dropdowns (which read the real academics classes).
export const mockClasses: ClassOption[] = seedClasses.map((c) => ({
  id: c.id,
  name: c.name,
}));

export const mockSubjects: SubjectOption[] = [
  { id: "sub_1", name: "Mathematics", code: "MATH" },
  { id: "sub_2", name: "English Language", code: "ENG" },
  { id: "sub_3", name: "French", code: "FRE" },
  { id: "sub_4", name: "Physics", code: "PHY" },
  { id: "sub_5", name: "Chemistry", code: "CHE" },
  { id: "sub_6", name: "Biology", code: "BIO" },
  { id: "sub_7", name: "History", code: "HIS" },
  { id: "sub_8", name: "Geography", code: "GEO" },
  { id: "sub_9", name: "Economics", code: "ECO" },
];

/** Sequences 1..6, two per term (Term 1 = 1 & 2, Term 2 = 3 & 4, Term 3 = 5 & 6). */
export const mockExams: ExamOption[] = Array.from({ length: 6 }, (_, i) => {
  const sequence = i + 1;
  return { id: `seq_${sequence}`, sequence, term: Math.ceil(sequence / 2) };
});

export function decisionFor(average: number): Decision {
  if (average >= PASS_MARK) return "Passed";
  if (average >= CONDITIONAL_MARK) return "Conditional";
  return "Repeat";
}

/**
 * Deterministic roster: ~25 students per class, each with a computed average
 * out of 20 and a rank within their class. Stable across reloads so mock mode
 * behaves like a real backend.
 */
function generate(): ReportRow[] {
  faker.seed(4102);
  const rows: ReportRow[] = [];

  for (const cls of mockClasses) {
    const size = faker.number.int({ min: 23, max: 28 });
    const cohort = Array.from({ length: size }, (_, i) => {
      const gender = faker.helpers.arrayElement(["Male", "Female"] as const);
      const first = faker.person.firstName(
        gender === "Male" ? "male" : "female",
      );
      const last = faker.person.lastName();
      const average = Math.round(faker.number.float({ min: 4, max: 18.5 }) * 4) / 4;
      return {
        id: `rpt_${cls.id}_${(i + 1).toString().padStart(2, "0")}`,
        fullName: `${first} ${last}`,
        matricule: faker.datatype.boolean(0.9)
          ? `${faker.number.int({ min: 20, max: 25 })}S${faker.number.int({ min: 1000, max: 9999 })}`
          : null,
        classId: cls.id,
        className: cls.name,
        average,
        total: size,
      };
    });

    // Rank within the class by descending average.
    cohort
      .slice()
      .sort((a, b) => b.average - a.average)
      .forEach((row, index) => {
        rows.push({
          ...row,
          rank: index + 1,
          decision: decisionFor(row.average),
        });
      });
  }

  return rows;
}

export const seedReportRows = generate();
