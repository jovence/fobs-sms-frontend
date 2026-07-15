import { faker } from "@faker-js/faker";
import type { ReferralStatus, ReferralUsage } from "./types";

/** The owner's referral code shown in the hero (mocked). */
export const REFERRAL_CODE = "AMINA-4821";

/** The referred school saves this much (XAF) at checkout. */
export const DISCOUNT_PER_REFERRAL = 25_000;

/** The referrer earns this much (XAF) once the referral converts. */
export const EARNING_PER_REFERRAL = 20_000;

const STATUS_WEIGHTS: ReferralStatus[] = [
  ...Array(8).fill("Successful"),
  ...Array(4).fill("Pending"),
  ...Array(2).fill("Expired"),
];

const SCHOOL_PREFIXES = [
  "Government Bilingual High School",
  "Saint Joseph College",
  "Presbyterian Secondary School",
  "Our Lady of Lourdes College",
  "Bilingual Grammar School",
  "Sacred Heart College",
  "Baptist High School",
  "Cameroon College of Arts & Science",
  "Progressive Comprehensive College",
  "Summerset Bilingual College",
];

const TOWNS = [
  "Buea",
  "Yaoundé",
  "Douala",
  "Bamenda",
  "Limbe",
  "Bafoussam",
  "Kumba",
  "Garoua",
  "Ebolowa",
  "Bertoua",
];

/** Deterministic seed dataset so mock mode is stable across reloads. */
function generate(): ReferralUsage[] {
  faker.seed(4821);
  return Array.from({ length: 14 }, (_, i) => {
    const status = faker.helpers.arrayElement(STATUS_WEIGHTS);
    const prefix = faker.helpers.arrayElement(SCHOOL_PREFIXES);
    const town = faker.helpers.arrayElement(TOWNS);
    return {
      id: `ref_${(i + 1).toString().padStart(3, "0")}`,
      schoolName: `${prefix}, ${town}`,
      date: faker.date.recent({ days: 300 }).toISOString(),
      discount: DISCOUNT_PER_REFERRAL,
      earnings: status === "Successful" ? EARNING_PER_REFERRAL : 0,
      status,
    } satisfies ReferralUsage;
  }).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const seedReferralUsages = generate();
