import { faker } from "@faker-js/faker";
import type { AdminSchool, SubscriptionTier } from "./types";

const SCHOOL_WORDS = [
  "Government Bilingual High School",
  "Sacred Heart College",
  "Presbyterian Secondary School",
  "Lycée Bilingue",
  "Collège Bilingue",
  "Baptist High School",
  "Saint Joseph College",
  "Government High School",
  "Islamic Secondary School",
  "Cameroon College of Arts",
];
const TOWNS = ["Buea", "Bamenda", "Yaoundé", "Douala", "Limbe", "Kumba", "Bafoussam", "Ebolowa", "Garoua", "Maroua"];
const TIERS: SubscriptionTier[] = [
  ...Array(5).fill("free"),
  ...Array(4).fill("basic"),
  ...Array(2).fill("pro"),
];

function generate(): AdminSchool[] {
  faker.seed(9001);
  return Array.from({ length: 55 }, (_, i) => {
    const base = faker.helpers.arrayElement(SCHOOL_WORDS);
    const town = faker.helpers.arrayElement(TOWNS);
    const name = `${base} ${town}`;
    const acronym = base
      .split(" ")
      .filter((w) => w[0] === w[0].toUpperCase())
      .map((w) => w[0])
      .join("")
      .slice(0, 4);
    return {
      id: `asch_${(i + 1).toString().padStart(3, "0")}`,
      name,
      acronym,
      code: `${acronym}-${faker.number.int({ min: 1000, max: 9999 })}`,
      ownerName: faker.person.fullName(),
      subscription: faker.helpers.arrayElement(TIERS),
      isDemo: faker.datatype.boolean(0.12),
      studentCount: faker.number.int({ min: 120, max: 1600 }),
      teacherCount: faker.number.int({ min: 8, max: 90 }),
      createdAt: faker.date.past({ years: 2 }).toISOString(),
    } satisfies AdminSchool;
  });
}

export const seedAdminSchools = generate();
