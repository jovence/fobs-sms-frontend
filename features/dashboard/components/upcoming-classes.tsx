import { MapPin } from "lucide-react";
import { upcomingClasses } from "../mock-data";

export function UpcomingClasses() {
  return (
    <ul className="space-y-2.5">
      {upcomingClasses.map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/50"
        >
          <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-primary/10 py-1.5 text-primary">
            <span className="text-sm font-bold tabular-nums leading-none">
              {c.time.split(":")[0]}
              <span className="text-[10px] font-medium">:{c.time.split(":")[1]}</span>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{c.subject}</p>
            <p className="truncate text-xs text-muted-foreground">
              {c.className} · {c.teacher}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {c.room}
          </span>
        </li>
      ))}
    </ul>
  );
}
