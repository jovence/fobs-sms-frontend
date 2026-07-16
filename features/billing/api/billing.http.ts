import { api } from "@/lib/api-client";
import { activeSchoolId } from "@/features/auth/tenancy";
import { ApiError } from "@/types";
import type { SubscriptionTier } from "../types";
import type { BillingService } from "./billing.service";

/**
 * Live implementation of {@link BillingService} against the Laravel backend
 * (`/api/dashboard/billing/*`, owner-scoped). The backend billing surface is an
 * upgrade / contact-sales flow, NOT a subscription+invoices dashboard, so only
 * {@link BillingService.requestUpgrade} has a faithful backend endpoint. See the
 * per-method notes and the returned summary's `gaps` for the mismatches.
 */

/** Backend plan tier → the numeric `plan_id` its upgrade flow expects.
 *  (Backend plans: Basic=2, Pro=3, Enterprise=4; there is no "free" plan.) */
const PLAN_ID: Partial<Record<SubscriptionTier, number>> = {
  basic: 2,
  pro: 3,
};

/** Shape of `POST /dashboard/billing/process-upgrade`'s `data` payload. */
interface ProcessUpgradePayload {
  type: "contact_sales" | "back";
  flash: {
    success?: string;
    error?: string;
    upgrade_details?: Record<string, unknown>;
  };
}

export const httpBillingService: BillingService = {
  async overview() {
    // GAP: no backend endpoint returns a `BillingOverview`. `GET /dashboard/billing`
    // yields an upgrade-form payload (owner's schools, free-text plans, selectedSchoolId)
    // with no current-subscription renewal/limits and no structured plan limits/featureKeys,
    // so it cannot be mapped onto `{ current, plans }` without fabrication.
    throw new ApiError("Not available yet.", "unknown", 501);
  },

  async invoices() {
    // GAP: there is no invoices endpoint in the billing route list at all.
    throw new ApiError("Not available yet.", "unknown", 501);
  },

  async requestUpgrade(tier) {
    const planId = PLAN_ID[tier];
    if (planId === undefined) {
      // `free` (and any non-upgradeable tier) has no backend plan to upgrade to.
      throw new ApiError("This plan cannot be requested.", "validation", 422);
    }

    const schoolId = activeSchoolId();
    if (!schoolId || schoolId === "none") {
      throw new ApiError("Select a school first.", "validation", 422);
    }

    const result = await api.post<ProcessUpgradePayload>(
      "/dashboard/billing/process-upgrade",
      { school_id: schoolId, plan_id: planId },
    );

    // The backend signals rejection (already subscribed, no permission, plan not yet
    // available, invalid referral) via `type: "back"` + `flash.error`; surface it.
    if (result.type === "back" || result.flash?.error) {
      throw new ApiError(
        result.flash?.error ?? "Unable to process the upgrade.",
        "validation",
        422,
      );
    }

    return { tier };
  },
};
