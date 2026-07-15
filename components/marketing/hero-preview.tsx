import { CalendarCheck, TrendingUp, Users } from "lucide-react";

/** Decorative, static product-glimpse for the hero — pure presentation, no data. */
export function HeroPreview() {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/5 blur-2xl" />
      <div className="rotate-[0.6deg] rounded-2xl border bg-card p-4 shadow-[var(--shadow-xl)]">
        {/* Fake window chrome */}
        <div className="mb-4 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/60" />
          <span className="ml-3 h-4 flex-1 rounded bg-muted" />
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <MiniStat icon={<Users className="size-4" />} label="Students" value="1,284" tone="text-primary bg-primary/10" />
          <MiniStat icon={<CalendarCheck className="size-4" />} label="Attendance" value="93.4%" tone="text-success bg-success/10" />
        </div>

        {/* Mini chart */}
        <div className="mt-3 rounded-xl border bg-background/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Enrollment</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-success">
              <TrendingUp className="size-3" /> 4.2%
            </span>
          </div>
          <svg viewBox="0 0 260 72" className="h-16 w-full" fill="none">
            <defs>
              <linearGradient id="hp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,54 L40,48 L80,52 L120,38 L160,42 L200,26 L260,20 L260,72 L0,72 Z" fill="url(#hp)" />
            <path d="M0,54 L40,48 L80,52 L120,38 L160,42 L200,26 L260,20" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>{icon}</span>
      <p className="mt-2 font-heading text-lg font-bold tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
