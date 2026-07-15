import { currentAcademicYear } from "@/lib/format";
import type { School } from "@/types";

const year = currentAcademicYear();

export const seedSchools: School[] = [
  {
    id: "sch_1",
    name: "Government Bilingual High School Molyko",
    acronym: "GBHS",
    code: "GBHS-4821",
    ownerId: "usr_owner",
    email: "contact@gbhsmolyko.cm",
    phone: "+237 677 000 111",
    address: "Molyko, Buea, South-West",
    academicYear: year,
    logoUrl: null,
    subscription: "basic",
    isDemo: false,
    studentCount: 1284,
    teacherCount: 62,
    classCount: 24,
    createdAt: "2025-01-12T08:00:00.000Z",
  },
  {
    id: "sch_2",
    name: "Collège Bilingue La Semence",
    acronym: "CBLS",
    code: "CBLS-7734",
    ownerId: "usr_owner",
    email: "info@lasemence.cm",
    phone: "+237 699 222 333",
    address: "Biyem-Assi, Yaoundé, Centre",
    academicYear: year,
    logoUrl: null,
    subscription: "free",
    isDemo: true,
    studentCount: 340,
    teacherCount: 18,
    classCount: 9,
    createdAt: "2025-03-04T09:30:00.000Z",
  },
];
