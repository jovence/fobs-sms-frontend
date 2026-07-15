import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/types";

const STYLES: Record<SubscriptionTier, string> = {
  free: "bg-muted text-muted-foreground ring-border",
  basic: "bg-info/10 text-info ring-info/20",
  pro: "bg-primary/10 text-primary ring-primary/20",
};

export function SubscriptionBadge({ tier }: { tier: SubscriptionTier }) {
  const t = useTranslations("schools.tiers");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        STYLES[tier],
      )}
    >
      {tier === "pro" && <Sparkles className="size-3" />}
      {t(tier)}
    </span>
  );
}
