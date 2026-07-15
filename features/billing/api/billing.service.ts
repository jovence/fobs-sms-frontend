import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { Paginated } from "@/types";
import type {
  BillingOverview,
  Invoice,
  InvoiceQuery,
  SubscriptionTier,
} from "../types";
import { currentSubscription, plans, seedInvoices } from "../mock-data";

export interface BillingService {
  overview(): Promise<BillingOverview>;
  invoices(query: InvoiceQuery): Promise<Paginated<Invoice>>;
  /** Mock "contact sales" flow — records interest, never charges a card. */
  requestUpgrade(tier: SubscriptionTier): Promise<{ tier: SubscriptionTier }>;
}

// ---- Mock implementation (persists to localStorage so it behaves like a backend) ----

let cache: Invoice[] | null = null;
function db(): Invoice[] {
  if (!cache) cache = mockStore.get<Invoice[]>("billing.invoices", seedInvoices);
  return cache;
}

const mockBillingService: BillingService = {
  async overview() {
    return withLatency({ current: currentSubscription, plans }, 400);
  },

  async invoices(query) {
    let rows = [...db()];
    const { search, status, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.number.toLowerCase().includes(q));
    }
    if (status) rows = rows.filter((r) => r.status === status);

    if (sortBy) {
      const dir = sortDir === "desc" ? -1 : 1;
      rows.sort((a, b) => {
        const av = a[sortBy] ?? "";
        const bv = b[sortBy] ?? "";
        return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
      });
    } else {
      // Default: newest invoice first.
      rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    }

    const total = rows.length;
    const start = (page - 1) * perPage;
    const items = rows.slice(start, start + perPage);

    return withLatency(
      { items, page, perPage, total, totalPages: Math.ceil(total / perPage) || 1 },
      450,
    );
  },

  async requestUpgrade(tier) {
    const log = mockStore.get<{ tier: SubscriptionTier; at: string }[]>(
      "billing.upgradeRequests",
      [],
    );
    mockStore.set("billing.upgradeRequests", [
      { tier, at: new Date().toISOString() },
      ...log,
    ]);
    return withLatency({ tier }, 700);
  },
};

export const billingService: BillingService =
  API_MODE === "live" ? mockBillingService : mockBillingService;
