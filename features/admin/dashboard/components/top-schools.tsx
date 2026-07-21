import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TopSchool } from "../types";

const TIER_STYLE: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-info/10 text-info",
  pro: "bg-primary/10 text-primary",
};

export function TopSchools({
  locale,
  tierLabel,
  schools,
}: {
  locale: string;
  tierLabel: (t: string) => string;
  schools: TopSchool[];
}) {
  return (
    <ul className="space-y-1">
      {schools.map((s, i) => (
        <li
          key={`${s.acronym}-${i}`}
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
        >
          <span className="w-4 text-center text-sm font-semibold text-muted-foreground tabular-nums">
            {i + 1}
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar text-[11px] font-bold text-sidebar-primary">
            {s.acronym.slice(0, 3)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatNumber(s.students, locale)}
            </p>
          </div>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", TIER_STYLE[s.tier])}>
            {tierLabel(s.tier)}
          </span>
        </li>
      ))}
    </ul>
  );
}
