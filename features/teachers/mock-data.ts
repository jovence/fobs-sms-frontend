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

/**
 * A subject in the school's catalog. `classIds` are the classes this subject is offered in —
 * the assign-classes page groups available classes by the teacher's subjects, mirroring the
 * backend's `subject->school_classes` relation.
 */
export interface MockSubject {
  id: string;
  name: string;
  code: string;
  level: string;
  series: string;
  classIds: string[];
}

export interface MockClass {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  section: string;
  studentCount: number;
}

/** The demo school's class list (ids referenced by {@link seedSubjects}). */
export const seedClasses: MockClass[] = [
  { id: "cls_001", name: "Form 1", level: "Lower Secondary", academicYear: "2025-2026", section: "A", studentCount: 48 },
  { id: "cls_002", name: "Form 2", level: "Lower Secondary", academicYear: "2025-2026", section: "A", studentCount: 45 },
  { id: "cls_003", name: "Form 3", level: "Lower Secondary", academicYear: "2025-2026", section: "B", studentCount: 42 },
  { id: "cls_004", name: "Form 4", level: "Upper Secondary", academicYear: "2025-2026", section: "Science", studentCount: 39 },
  { id: "cls_005", name: "Form 5", level: "Upper Secondary", academicYear: "2025-2026", section: "Science", studentCount: 36 },
  { id: "cls_006", name: "Lower Sixth", level: "High School", academicYear: "2025-2026", section: "Science", studentCount: 31 },
  { id: "cls_007", name: "Upper Sixth", level: "High School", academicYear: "2025-2026", section: "Arts", studentCount: 28 },
  { id: "cls_008", name: "Upper Sixth", level: "High School", academicYear: "2025-2026", section: "Science", studentCount: 27 },
];

/** The demo school's subject catalog (the "available subjects" of the assign-subjects page). */
export const seedSubjects: MockSubject[] = [
  { id: "sub_001", name: "Mathematics", code: "MATH", level: "O/A Level", series: "Science", classIds: ["cls_001", "cls_002", "cls_003", "cls_004", "cls_005", "cls_006", "cls_008"] },
  { id: "sub_002", name: "English Language", code: "ENG", level: "O/A Level", series: "General", classIds: ["cls_001", "cls_002", "cls_003", "cls_004", "cls_005"] },
  { id: "sub_003", name: "French", code: "FR", level: "O/A Level", series: "General", classIds: ["cls_001", "cls_002", "cls_003", "cls_004", "cls_005"] },
  { id: "sub_004", name: "Physics", code: "PHY", level: "A Level", series: "Science", classIds: ["cls_004", "cls_005", "cls_006", "cls_008"] },
  { id: "sub_005", name: "Chemistry", code: "CHEM", level: "A Level", series: "Science", classIds: ["cls_004", "cls_005", "cls_006", "cls_008"] },
  { id: "sub_006", name: "Biology", code: "BIO", level: "A Level", series: "Science", classIds: ["cls_004", "cls_005", "cls_006", "cls_008"] },
  { id: "sub_007", name: "History", code: "HIST", level: "O/A Level", series: "Arts", classIds: ["cls_001", "cls_002", "cls_003", "cls_007"] },
  { id: "sub_008", name: "Geography", code: "GEO", level: "O/A Level", series: "Arts", classIds: ["cls_001", "cls_002", "cls_003", "cls_007"] },
  { id: "sub_009", name: "Economics", code: "ECON", level: "A Level", series: "Commercial", classIds: ["cls_004", "cls_005", "cls_007"] },
  { id: "sub_010", name: "Computer Science", code: "CS", level: "O/A Level", series: "Science", classIds: ["cls_003", "cls_004", "cls_005", "cls_006", "cls_008"] },
  { id: "sub_011", name: "Literature in English", code: "LIT", level: "A Level", series: "Arts", classIds: ["cls_006", "cls_007"] },
  { id: "sub_012", name: "Citizenship Education", code: "CIT", level: "O Level", series: "General", classIds: ["cls_001", "cls_002", "cls_003"] },
];
