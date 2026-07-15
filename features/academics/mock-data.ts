import { faker } from "@faker-js/faker";
import { currentAcademicYear } from "@/lib/format";
import type { SchoolClass, Subject } from "./types";

const year = currentAcademicYear();

const CLASS_DEFS: Array<{ name: string; level: SchoolClass["level"]; section: SchoolClass["section"] }> = [
  { name: "Form 1", level: "lower", section: "english" },
  { name: "Form 2", level: "lower", section: "english" },
  { name: "Form 3", level: "lower", section: "english" },
  { name: "Form 4 Science", level: "lower", section: "english" },
  { name: "Form 4 Arts", level: "lower", section: "english" },
  { name: "Form 5", level: "lower", section: "english" },
  { name: "Lower Sixth", level: "upper", section: "english" },
  { name: "Upper Sixth", level: "upper", section: "english" },
  { name: "6ème", level: "lower", section: "french" },
  { name: "5ème", level: "lower", section: "french" },
  { name: "Terminale", level: "upper", section: "french" },
];

function generateClasses(): SchoolClass[] {
  faker.seed(777);
  return CLASS_DEFS.map((def, i) => ({
    id: `cls_${(i + 1).toString().padStart(2, "0")}`,
    name: def.name,
    level: def.level,
    section: def.section,
    academicYear: year,
    classMaster: faker.datatype.boolean(0.75)
      ? `${faker.person.lastName()}`
      : null,
    studentsCount: faker.number.int({ min: 22, max: 68 }),
    subjectsCount: faker.number.int({ min: 6, max: 12 }),
    createdAt: faker.date.recent({ days: 300 }).toISOString(),
  }));
}

const SUBJECT_DEFS: Array<{ name: string; code: string; series: Subject["series"] }> = [
  { name: "Mathematics", code: "MATH", series: "both" },
  { name: "English Language", code: "ENG", series: "both" },
  { name: "French", code: "FRE", series: "both" },
  { name: "Physics", code: "PHY", series: "science" },
  { name: "Chemistry", code: "CHE", series: "science" },
  { name: "Biology", code: "BIO", series: "science" },
  { name: "Further Mathematics", code: "FMATH", series: "science" },
  { name: "Computer Science", code: "CSC", series: "science" },
  { name: "History", code: "HIS", series: "art" },
  { name: "Geography", code: "GEO", series: "art" },
  { name: "Economics", code: "ECO", series: "art" },
  { name: "Literature in English", code: "LIT", series: "art" },
  { name: "Philosophy", code: "PHI", series: "art" },
  { name: "Citizenship", code: "CIT", series: "both" },
  { name: "Physical Education", code: "PE", series: "both" },
  { name: "Religious Studies", code: "REL", series: "art" },
];

function generateSubjects(): Subject[] {
  faker.seed(778);
  return SUBJECT_DEFS.map((def, i) => ({
    id: `sub_${(i + 1).toString().padStart(2, "0")}`,
    name: def.name,
    code: def.code,
    series: def.series,
    classesCount: faker.number.int({ min: 1, max: 8 }),
    createdAt: faker.date.recent({ days: 300 }).toISOString(),
  }));
}

export const seedClasses = generateClasses();
export const seedSubjects = generateSubjects();
