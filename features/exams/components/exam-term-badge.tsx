import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Term } from "../types";

const STYLES: Record<Term, string> = {
  First: "bg-primary/10 text-primary ring-primary/20",
  Second: "bg-warning/15 text-warning ring-warning/25",
  Third: "bg-success/10 text-success ring-success/20",
};

export function ExamTermBadge({ term }: { term: Term }) {
  const t = useTranslations("exams.term");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        STYLES[term],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t(term)}
    </span>
  );
}
