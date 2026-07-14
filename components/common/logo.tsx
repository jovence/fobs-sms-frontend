import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  tone = "brand",
}: {
  className?: string;
  showWordmark?: boolean;
  tone?: "brand" | "invert";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-lg shadow-sm",
          tone === "brand"
            ? "bg-primary text-primary-foreground"
            : "bg-sidebar-primary text-sidebar-primary-foreground",
        )}
        aria-hidden
      >
        <GraduationCap className="size-5" strokeWidth={2.25} />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-lg font-extrabold tracking-tight">
            FOBS
          </span>
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.2em]",
              tone === "invert" ? "text-sidebar-foreground/70" : "text-muted-foreground",
            )}
          >
            School SMS
          </span>
        </span>
      )}
    </span>
  );
}
