import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  accent = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  accent?: "primary" | "success" | "info" | "warning";
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
    warning: "bg-warning/15 text-warning",
  }[accent];

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-bold tabular-nums tracking-tight">
            {value}
          </p>
          {typeof delta === "number" && (
            <p
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                delta >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {delta >= 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {Math.abs(delta)}%
            </p>
          )}
        </div>
        <span className={cn("grid size-10 place-items-center rounded-lg", accentClass)}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
