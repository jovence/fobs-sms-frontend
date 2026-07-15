import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { RegistrationStatus } from "../types";

const STYLES: Record<RegistrationStatus, string> = {
  Approved: "bg-success/10 text-success ring-success/20",
  Pending: "bg-warning/15 text-warning ring-warning/25",
  Rejected: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function StudentStatusBadge({ status }: { status: RegistrationStatus }) {
  const t = useTranslations("students.status");
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
