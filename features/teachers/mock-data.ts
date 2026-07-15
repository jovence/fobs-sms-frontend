import { faker } from "@faker-js/faker";
import type { Teacher } from "./types";

const SPECIALIZATIONS = [
  "Mathematics",
  "English Language",
  "French",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
  "Computer Science",
  "Physical Education",
  "Literature",
];

const QUALIFICATIONS = ["DIPES II", "DIPES I", "BSc + PGDE", "MSc", "BA Ed", "PhD"];

function generate(): Teacher[] {
  faker.seed(4048);
  return Array.from({ length: 42 }, (_, i) => {
    const gender = faker.helpers.arrayElement(["male", "female"] as const);
    const first = faker.person.firstName(gender);
    const last = faker.person.lastName();
    const status = faker.datatype.boolean(0.16) ? "pending" : "active";
    return {
      id: `tch_${(i + 1).toString().padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      phone: `+237 6${faker.string.numeric(8)}`,
      specialization: faker.helpers.arrayElement(SPECIALIZATIONS),
      qualifications: faker.helpers.arrayElement(QUALIFICATIONS),
      experienceYears: faker.number.int({ min: 1, max: 24 }),
      status,
      subjectsCount: status === "pending" ? 0 : faker.number.int({ min: 1, max: 4 }),
      classesCount: status === "pending" ? 0 : faker.number.int({ min: 1, max: 6 }),
      avatarUrl: null,
      joinedAt: faker.date.recent({ days: 400 }).toISOString(),
    } satisfies Teacher;
  });
}

export const seedTeachers = generate();
