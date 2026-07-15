import { faker } from "@faker-js/faker";
import type { Parent } from "./types";

const OCCUPATIONS = [
  "Trader",
  "Teacher",
  "Civil Servant",
  "Farmer",
  "Nurse",
  "Engineer",
  "Accountant",
  "Driver",
  "Businesswoman",
  "Businessman",
  "Tailor",
  "Mechanic",
  "Pharmacist",
  "Lawyer",
  "Journalist",
  "Electrician",
];

function generate(): Parent[] {
  faker.seed(3448);
  return Array.from({ length: 34 }, (_, i) => {
    const gender = faker.helpers.arrayElement(["male", "female"] as const);
    const first = faker.person.firstName(gender);
    const last = faker.person.lastName();
    return {
      id: `par_${(i + 1).toString().padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      phone: `+237 6${faker.string.numeric(8)}`,
      occupation: faker.helpers.arrayElement(OCCUPATIONS),
      address: `${faker.location.streetAddress()}, ${faker.helpers.arrayElement([
        "Yaoundé",
        "Douala",
        "Bamenda",
        "Buea",
        "Bafoussam",
        "Limbe",
        "Garoua",
      ])}`,
      childrenCount: faker.number.int({ min: 1, max: 5 }),
      avatarUrl: null,
      createdAt: faker.date.recent({ days: 500 }).toISOString(),
    } satisfies Parent;
  });
}

export const seedParents = generate();
