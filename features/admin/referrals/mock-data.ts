import { faker } from "@faker-js/faker";
import type { AdminReferrer } from "./types";

const TOWNS = ["Buea", "Bamenda", "Yaoundé", "Douala", "Limbe", "Kumba", "Bafoussam", "Ebolowa"];
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[faker.number.int({ min: 0, max: ALPHABET.length - 1 })];
  return s;
}

function generate(): AdminReferrer[] {
  faker.seed(3131);
  return Array.from({ length: 44 }, (_, i) => {
    const count = faker.number.int({ min: 0, max: 15 });
    return {
      id: `ref_${(i + 1).toString().padStart(3, "0")}`,
      name: faker.person.fullName(),
      phone: `+237 6${faker.string.numeric(8)}`,
      code: makeCode(),
      residence: faker.helpers.arrayElement(TOWNS),
      referralCount: count,
      earnings: count * 20000,
      isActive: faker.datatype.boolean(0.82),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    } satisfies AdminReferrer;
  });
}

export const seedReferrers = generate();
