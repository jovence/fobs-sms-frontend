import { faker } from "@faker-js/faker";
import type { AdminUser, Role } from "./types";

const ROLE_POOL: Role[] = [
  ...Array(60).fill("parent"),
  ...Array(45).fill("teacher"),
  ...Array(22).fill("owner"),
  ...Array(3).fill("admin"),
];

function generate(): AdminUser[] {
  faker.seed(5150);
  return ROLE_POOL.map((role, i) => {
    const gender = faker.helpers.arrayElement(["male", "female"] as const);
    const first = faker.person.firstName(gender);
    const last = faker.person.lastName();
    return {
      id: `usr_${(i + 1).toString().padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      phone: `+237 6${faker.string.numeric(8)}`,
      role,
      joinedAt: faker.date.past({ years: 2 }).toISOString(),
    } satisfies AdminUser;
  });
}

export const seedAdminUsers = generate();
