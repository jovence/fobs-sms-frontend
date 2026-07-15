import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ReferralStatus } from "../types";

const STYLES: Record<ReferralStatus, string> = {
  Successful: "bg-success/10 text-success ring-success/20",
  Pending: "bg-warning/15 text-warning ring-warning/25",
  Expired: "bg-muted text-muted-foreground ring-border",
};

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  const t = useTranslations("referrals.status");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t(status)}
    </span>
  );
}
