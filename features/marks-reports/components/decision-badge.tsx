import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Decision } from "../types";

const STYLES: Record<Decision, string> = {
  Passed: "bg-success/10 text-success ring-success/20",
  Conditional: "bg-warning/15 text-warning ring-warning/25",
  Repeat: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function DecisionBadge({ decision }: { decision: Decision }) {
  const t = useTranslations("reports.decision");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[decision],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t(decision)}
    </span>
  );
}
