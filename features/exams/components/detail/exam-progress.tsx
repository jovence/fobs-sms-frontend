import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

/** Thin progress bar shared across the exam dashboard (completion, grades, per-class fill). */
export function ExamProgress({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all", TONES[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** Completion → bar colour: green when done, amber when in progress, red when barely started. */
export function completionTone(rate: number): Tone {
  if (rate >= 100) return "success";
  if (rate >= 50) return "warning";
  return "danger";
}
