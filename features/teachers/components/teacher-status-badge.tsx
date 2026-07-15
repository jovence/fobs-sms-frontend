import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { TeacherStatus } from "../types";

const STYLES: Record<TeacherStatus, string> = {
  active: "bg-success/10 text-success ring-success/20",
  pending: "bg-warning/15 text-warning ring-warning/25",
};

export function TeacherStatusBadge({ status }: { status: TeacherStatus }) {
  const t = useTranslations("teachers.status");
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
