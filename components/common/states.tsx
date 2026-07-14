import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Reusable, consistent empty / error / loading / forbidden states across every module. */

function Shell({
  icon,
  title,
  description,
  action,
  tone = "muted",
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "muted" | "danger";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center",
        className,
      )}
      role={tone === "danger" ? "alert" : undefined}
    >
      <div
        className={cn(
          "grid size-12 place-items-center rounded-full",
          tone === "danger"
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <p className="font-heading text-base font-semibold">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState(props: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return <Shell {...props} icon={props.icon ?? <Inbox className="size-6" />} />;
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <Shell
      tone="danger"
      icon={<AlertTriangle className="size-6" />}
      title={title}
      description={description}
      className={className}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
    />
  );
}

export function ForbiddenState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Shell
      icon={<Lock className="size-6" />}
      title={title}
      description={description}
      className={className}
    />
  );
}

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label ?? "Loading…"}</span>
      <span className="sr-only">Loading</span>
    </div>
  );
}
