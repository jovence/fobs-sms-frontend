import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "../types";

const STYLES: Record<InvoiceStatus, string> = {
  paid: "bg-success/10 text-success ring-success/20",
  pending: "bg-warning/15 text-warning ring-warning/25",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useTranslations("billing.invoices.status");
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
