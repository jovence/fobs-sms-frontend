import { faker } from "@faker-js/faker";
import type { ActivityEntry, ActivityType } from "./types";

const TYPES: ActivityType[] = ["enrollment", "marks", "attendance", "payment", "teacher", "school"];
const SCHOOLS = [
  "GBHS Molyko",
  "Sacred Heart College",
  "Lycée Bilingue Deido",
  "Presbyterian Sec. School",
  "Collège La Semence",
  "Baptist High School Buea",
];

function describe(type: ActivityType): string {
  switch (type) {
    case "enrollment":
      return `${faker.number.int({ min: 1, max: 8 })} students enrolled in ${faker.helpers.arrayElement(["Form 1", "Form 4 Science", "Lower Sixth"])}`;
    case "marks":
      return `Sequence ${faker.number.int({ min: 1, max: 6 })} marks submitted — ${faker.helpers.arrayElement(["Mathematics", "English", "Physics", "History"])}`;
    case "attendance":
      return `Attendance recorded for ${faker.helpers.arrayElement(["Form 3 A", "Form 5 Arts", "Upper Sixth"])}`;
    case "payment":
      return `Subscription payment received · ${faker.helpers.arrayElement(["200,000", "250,000"])} XAF`;
    case "teacher":
      return `Teacher ${faker.helpers.arrayElement(["approved", "joined", "removed"])} — ${faker.helpers.arrayElement(["Chemistry", "French", "Biology"])}`;
    case "school":
      return `School ${faker.helpers.arrayElement(["upgraded to Basic", "created", "toggled demo"])}`;
  }
}

function generate(): ActivityEntry[] {
  faker.seed(2727);
  const rows = Array.from({ length: 90 }, (_, i) => {
    const type = faker.helpers.arrayElement(TYPES);
    return {
      id: `act_${(i + 1).toString().padStart(3, "0")}`,
      type,
      description: describe(type),
      actor: faker.person.fullName(),
      school: faker.helpers.arrayElement(SCHOOLS),
      at: faker.date.recent({ days: 30 }).toISOString(),
    } satisfies ActivityEntry;
  });
  return rows.sort((a, b) => (a.at < b.at ? 1 : -1));
}

export const seedActivity = generate();
