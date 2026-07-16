import { faker } from "@faker-js/faker";
import { seedClasses } from "@/features/academics/mock-data";
import {
  attendanceRate,
  tallyRecords,
  type AttendanceRecord,
  type AttendanceSession,
  type AttendanceStatus,
  type ClassOption,
  type RosterStudent,
  type SubjectOption,
} from "./types";

// Same demo classes as the Academics module (matching IDs) so seeded sessions line up
// with the class dropdowns (which read the real academics classes).
export const mockClasses: ClassOption[] = seedClasses.map((c) => ({
  id: c.id,
  name: c.name,
}));

export const mockSubjects: SubjectOption[] = [
  { id: "sub_1", name: "Mathematics" },
  { id: "sub_2", name: "English Language" },
  { id: "sub_3", name: "French" },
  { id: "sub_4", name: "Physics" },
  { id: "sub_5", name: "Chemistry" },
  { id: "sub_6", name: "Biology" },
  { id: "sub_7", name: "History" },
  { id: "sub_8", name: "Geography" },
  { id: "sub_9", name: "Computer Science" },
  { id: "sub_10", name: "Economics" },
];

/** Stable numeric seed derived from a class id, so each class keeps its own roster. */
function seedFor(classId: string): number {
  let hash = 0;
  for (let i = 0; i < classId.length; i += 1) {
    hash = (hash * 31 + classId.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) + 1;
}

/** ~30 students per class, deterministic so the roster is stable across reloads. */
export function rosterForClass(classId: string): RosterStudent[] {
  faker.seed(seedFor(classId));
  const size = faker.number.int({ min: 28, max: 32 });
  return Array.from({ length: size }, (_, i) => {
    const gender = faker.helpers.arrayElement(["male", "female"] as const);
    const first = faker.person.firstName(gender);
    const last = faker.person.lastName();
    return {
      id: `${classId}_stu_${(i + 1).toString().padStart(2, "0")}`,
      fullName: `${first} ${last}`,
      matricule: faker.datatype.boolean(0.9)
        ? `${faker.number.int({ min: 20, max: 25 })}S${faker.number.int({ min: 1000, max: 9999 })}`
        : null,
      photoUrl: null,
    } satisfies RosterStudent;
  });
}

const STATUS_WEIGHTS: AttendanceStatus[] = [
  ...Array(8).fill("Present"),
  ...Array(1).fill("Late"),
  ...Array(1).fill("Absent"),
] as AttendanceStatus[];

/** Deterministic seed dataset of past sessions so mock mode is stable across reloads. */
function generateSessions(): AttendanceSession[] {
  faker.seed(4102);
  return Array.from({ length: 40 }, (_, i) => {
    const cls = faker.helpers.arrayElement(mockClasses);
    const subject = faker.helpers.arrayElement(mockSubjects);
    const size = faker.number.int({ min: 28, max: 32 });
    const records: AttendanceRecord[] = Array.from({ length: size }, (_, s) => {
      const status = faker.helpers.arrayElement(STATUS_WEIGHTS);
      return {
        studentId: `${cls.id}_stu_${(s + 1).toString().padStart(2, "0")}`,
        status,
        hours: status === "Absent" ? 0 : faker.number.int({ min: 1, max: 5 }),
      };
    });
    const counts = tallyRecords(records);
    const createdAt = faker.date.recent({ days: 120 }).toISOString();
    return {
      id: `att_${(i + 1).toString().padStart(3, "0")}`,
      date: createdAt.slice(0, 10),
      classId: cls.id,
      className: cls.name,
      subjectId: subject.id,
      subjectName: subject.name,
      counts,
      rate: attendanceRate(counts),
      createdAt,
    } satisfies AttendanceSession;
  }).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const seedSessions = generateSessions();
