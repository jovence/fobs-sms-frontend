import { cn } from "@/lib/utils";

/** Generic on/off pill used for the Published (Yes/No) and Mark entry (Open/Closed) columns. */
export function ExamFlagBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        active
          ? "bg-success/10 text-success ring-success/20"
          : "bg-muted text-muted-foreground ring-border/60",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
