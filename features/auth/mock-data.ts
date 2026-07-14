import type { School, SchoolMembership, User } from "@/types";
import { currentAcademicYear } from "@/lib/format";

/** Seed accounts for mock mode. Password for all: `password`. */
export interface MockAccount {
  password: string;
  user: User;
  memberships: SchoolMembership[];
}

const year = currentAcademicYear();

const gbhsMolyko: School = {
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
};

const collegeBilingue: School = {
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
};

export const mockAccounts: MockAccount[] = [
  {
    password: "password",
    user: {
      id: "usr_owner",
      name: "Amina Nkeng",
      email: "owner@fobs.cm",
      phone: "+237 677 000 111",
      role: "owner",
      emailVerifiedAt: "2025-01-12T08:00:00.000Z",
      createdAt: "2025-01-12T08:00:00.000Z",
    },
    memberships: [
      { school: gbhsMolyko, role: "owner", isActive: true },
      { school: collegeBilingue, role: "owner", isActive: true },
    ],
  },
  {
    password: "password",
    user: {
      id: "usr_admin",
      name: "Platform Admin",
      email: "admin@fobs.cm",
      phone: "+237 699 999 000",
      role: "admin",
      emailVerifiedAt: "2024-11-01T08:00:00.000Z",
      createdAt: "2024-11-01T08:00:00.000Z",
    },
    memberships: [{ school: gbhsMolyko, role: "admin", isActive: true }],
  },
];

export const demoSchools = [gbhsMolyko, collegeBilingue];
