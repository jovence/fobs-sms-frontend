import { faker } from "@faker-js/faker";
import type {
  CurrentSubscription,
  Invoice,
  InvoiceKind,
  Plan,
  SubscriptionTier,
} from "./types";

/** Annual prices in XAF (formatted via formatCurrency at render time). */
export const PLAN_PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 200_000,
  pro: 250_000,
};

/** Per-SMS unit price used to price top-up invoices. */
const SMS_UNIT_PRICE = 15;
const SETUP_FEE = 25_000;

export const plans: Plan[] = [
  {
    tier: "free",
    priceYearly: PLAN_PRICES.free,
    highlighted: false,
    limits: { students: 50, teachers: 5, smsPerMonth: 100 },
    featureKeys: ["coreSms", "studentRecords", "attendance"],
  },
  {
    tier: "basic",
    priceYearly: PLAN_PRICES.basic,
    highlighted: false,
    limits: { students: 500, teachers: 40, smsPerMonth: 2_000 },
    featureKeys: [
      "coreSms",
      "studentRecords",
      "attendance",
      "reportCards",
      "smsNotifications",
      "prioritySupport",
    ],
  },
  {
    tier: "pro",
    priceYearly: PLAN_PRICES.pro,
    highlighted: true,
    limits: { students: "unlimited", teachers: "unlimited", smsPerMonth: "unlimited" },
    featureKeys: [
      "coreSms",
      "studentRecords",
      "attendance",
      "reportCards",
      "smsNotifications",
      "advancedAnalytics",
      "multiSchool",
      "apiAccess",
      "customBranding",
    ],
  },
];

/** The mock active subscription — "Basic", renewing at the start of next year. */
export const currentSubscription: CurrentSubscription = {
  tier: "basic",
  renewalDate: "2027-01-15T00:00:00.000Z",
  limits: plans.find((p) => p.tier === "basic")!.limits,
};

const KIND_WEIGHTS: InvoiceKind[] = [
  "subscription",
  "subscription",
  "subscription",
  "smsTopup",
  "setupFee",
];

/** Deterministic seed dataset so mock mode is stable across reloads. */
function generate(): Invoice[] {
  faker.seed(4127);
  const base = new Date("2026-07-01T00:00:00.000Z");

  return Array.from({ length: 11 }, (_, i) => {
    // Most recent first; roughly one invoice per five weeks going back in time.
    const date = new Date(base.getTime() - i * 35 * 24 * 60 * 60 * 1000);
    const kind = i === 0 ? "subscription" : faker.helpers.arrayElement(KIND_WEIGHTS);

    let planTier: SubscriptionTier | null = null;
    let quantity: number | null = null;
    let amount: number;

    if (kind === "subscription") {
      planTier = faker.helpers.arrayElement(["basic", "pro"] as const);
      amount = PLAN_PRICES[planTier];
    } else if (kind === "smsTopup") {
      quantity = faker.helpers.arrayElement([500, 1_000, 2_000]);
      amount = quantity * SMS_UNIT_PRICE;
    } else {
      amount = SETUP_FEE;
    }

    // The newest invoice is still awaiting payment; the rest are settled.
    const status = i === 0 ? "pending" : faker.datatype.boolean(0.08) ? "pending" : "paid";

    return {
      id: `inv_${(i + 1).toString().padStart(3, "0")}`,
      number: `INV-${date.getFullYear()}-${(11 - i).toString().padStart(4, "0")}`,
      date: date.toISOString(),
      kind,
      planTier,
      quantity,
      amount,
      status,
    } satisfies Invoice;
  });
}

export const seedInvoices = generate();
