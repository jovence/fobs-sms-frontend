import {
  BanknoteArrowUp,
  CalendarCheck,
  PenSquare,
  UserPlus,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { recentActivity, type ActivityEntry } from "../mock-data";
import { Stagger, StaggerItem } from "@/components/common/motion";

const ICONS: Record<ActivityEntry["type"], { icon: LucideIcon; tone: string }> = {
  enrollment: { icon: UserPlus, tone: "bg-primary/10 text-primary" },
  marks: { icon: PenSquare, tone: "bg-info/10 text-info" },
  attendance: { icon: CalendarCheck, tone: "bg-success/10 text-success" },
  payment: { icon: BanknoteArrowUp, tone: "bg-warning/15 text-warning" },
  teacher: { icon: GraduationCap, tone: "bg-chart-5/15 text-chart-5" },
};

export function ActivityFeed() {
  return (
    <Stagger className="space-y-1">
      {recentActivity.map((entry) => {
        const { icon: Icon, tone } = ICONS[entry.type];
        return (
          <StaggerItem key={entry.id}>
            <div className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60">
              <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-medium">{entry.title}</p>
                <p className="text-xs text-muted-foreground">{entry.meta}</p>
              </div>
              <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                {entry.at}
              </span>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
