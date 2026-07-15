"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/common/motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Plan, SubscriptionTier } from "../types";

export function PlansGrid({
  plans,
  currentTier,
  onSelect,
}: {
  plans: Plan[];
  currentTier: SubscriptionTier;
  onSelect: (plan: Plan) => void;
}) {
  const t = useTranslations("billing");
  const tp = useTranslations("billing.plans");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold">{tp("title")}</h2>
        <p className="text-sm text-muted-foreground">{tp("subtitle")}</p>
      </div>

      <Stagger className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          const name = tp(`tiers.${plan.tier}.name`);
          return (
            <StaggerItem key={plan.tier} className="h-full">
              <div
                className={cn(
                  "card-interactive relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-[var(--shadow-sm)]",
                  plan.highlighted && "border-primary/40 ring-1 ring-primary/30",
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-2.5 right-5 shadow-[var(--shadow-sm)]">
                    {tp("recommended")}
                  </Badge>
                )}

                <div className="space-y-1">
                  <h3 className="font-heading text-base font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tp(`tiers.${plan.tier}.tagline`)}
                  </p>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-bold tracking-tight tabular-nums">
                    {formatCurrency(plan.priceYearly, locale)}
                  </span>
                  <span className="text-sm text-muted-foreground">{t("perYear")}</span>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.featureKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span>{tp(`featureList.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-6 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => onSelect(plan)}
                >
                  {isCurrent ? tp("currentCta") : tp("cta", { plan: name })}
                </Button>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
