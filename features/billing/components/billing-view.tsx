"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/common/motion";
import { ErrorState, ForbiddenState } from "@/components/common/states";
import { Shimmer } from "@/components/common/skeletons";
import { can } from "@/lib/rbac";
import { useCurrentUser } from "@/features/auth/hooks";
import { useBillingOverview } from "../hooks";
import type { Plan } from "../types";
import { CurrentPlanCard } from "./current-plan-card";
import { PlansGrid } from "./plans-grid";
import { InvoicesTable } from "./invoices-table";
import { UpgradeDialog } from "./upgrade-dialog";

function OverviewSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Shimmer className="h-48 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Shimmer className="h-72 rounded-2xl" />
        <Shimmer className="h-72 rounded-2xl" />
        <Shimmer className="h-72 rounded-2xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function BillingView() {
  const t = useTranslations("billing");
  const user = useCurrentUser();
  const { data, isLoading, isError, refetch } = useBillingOverview();

  const [upgradeTarget, setUpgradeTarget] = useState<Plan | null>(null);

  if (!can(user?.role, "billing.view")) {
    return (
      <ForbiddenState
        title={t("forbidden.title")}
        description={t("forbidden.description")}
      />
    );
  }

  return (
    <div className="space-y-8">
      {isLoading ? (
        <OverviewSkeleton />
      ) : isError || !data ? (
        <ErrorState
          title={t("error.title")}
          description={t("error.description")}
          retryLabel={t("error.retry")}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <Reveal>
            <CurrentPlanCard
              current={data.current}
              onUpgrade={() => {
                const target =
                  data.plans.find((p) => p.highlighted && p.tier !== data.current.tier) ??
                  data.plans.find((p) => p.tier !== data.current.tier) ??
                  null;
                setUpgradeTarget(target);
              }}
            />
          </Reveal>

          <Reveal delay={0.05}>
            <PlansGrid
              plans={data.plans}
              currentTier={data.current.tier}
              onSelect={setUpgradeTarget}
            />
          </Reveal>
        </>
      )}

      <Reveal delay={0.1}>
        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              {t("invoices.title")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("invoices.subtitle")}</p>
          </div>
          <InvoicesTable />
        </section>
      </Reveal>

      <UpgradeDialog
        plan={upgradeTarget}
        open={!!upgradeTarget}
        onOpenChange={(open) => !open && setUpgradeTarget(null)}
      />
    </div>
  );
}
