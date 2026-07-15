"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { formatNumber } from "@/lib/format";
import { subscriptionBreakdown } from "../mock-data";

const TIERS = [
  { key: "free", color: "bg-muted-foreground/40", value: subscriptionBreakdown.free },
  { key: "basic", color: "bg-info", value: subscriptionBreakdown.basic },
  { key: "pro", color: "bg-primary", value: subscriptionBreakdown.pro },
] as const;

export function SubscriptionBreakdown({ locale }: { locale: string }) {
  const t = useTranslations("admin.tiers");
  const reduce = useReducedMotion();
  const total = TIERS.reduce((sum, x) => sum + x.value, 0) || 1;

  return (
    <div className="space-y-4">
      {TIERS.map((tier) => {
        const pct = (tier.value / total) * 100;
        return (
          <div key={tier.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t(tier.key)}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatNumber(tier.value, locale)} · {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full ${tier.color}`}
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
