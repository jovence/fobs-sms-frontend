import { faker } from "@faker-js/faker";
import type { ClassOption, Student } from "./types";

export const mockClasses: ClassOption[] = [
  { id: "cls_1", name: "Form 1" },
  { id: "cls_2", name: "Form 2" },
  { id: "cls_3", name: "Form 3" },
  { id: "cls_4", name: "Form 4 Science" },
  { id: "cls_5", name: "Form 4 Arts" },
  { id: "cls_6", name: "Form 5" },
  { id: "cls_7", name: "Lower Sixth" },
  { id: "cls_8", name: "Upper Sixth" },
];

const STATUS_WEIGHTS = [
  ...Array(7).fill("Approved"),
  ...Array(2).fill("Pending"),
  "Rejected",
] as const;

const PLACES = [
  "Buea",
  "Yaoundé",
  "Douala",
  "Bamenda",
  "Limbe",
  "Bafoussam",
  "Kumba",
  "Garoua",
];

/** Deterministic seed dataset so mock mode is stable across reloads. */
function generate(): Student[] {
  faker.seed(2026);
  return Array.from({ length: 86 }, (_, i) => {
    const gender = faker.helpers.arrayElement(["Male", "Female"] as const);
    const cls = faker.helpers.arrayElement(mockClasses);
    const first = faker.person.firstName(gender === "Male" ? "male" : "female");
    const last = faker.person.lastName();
    return {
      id: `stu_${(i + 1).toString().padStart(3, "0")}`,
      matricule: faker.datatype.boolean(0.9)
        ? `${faker.number.int({ min: 20, max: 25 })}S${faker.number.int({ min: 1000, max: 9999 })}`
        : null,
      fullName: `${first} ${last}`,
      gender,
      dateOfBirth: faker.date
        .birthdate({ min: 11, max: 20, mode: "age" })
        .toISOString(),
      placeOfBirth: faker.helpers.arrayElement(PLACES),
      classId: cls.id,
      className: cls.name,
      status: faker.helpers.arrayElement(STATUS_WEIGHTS),
      guardianName: `${faker.person.firstName()} ${last}`,
      photoUrl: null,
      isRepeater: faker.datatype.boolean(0.12),
      createdAt: faker.date.recent({ days: 240 }).toISOString(),
    } satisfies Student;
  });
}

export const seedStudents = generate();
