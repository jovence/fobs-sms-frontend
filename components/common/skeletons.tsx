import { cn } from "@/lib/utils";

/** Shimmer block — the base for all skeletons (uses the .skeleton utility). */
export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <Shimmer className="h-3.5 w-20" />
          <Shimmer className="h-7 w-24" />
          <Shimmer className="h-3 w-16" />
        </div>
        <Shimmer className="size-10 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Shimmer className="h-7 w-64" />
        <Shimmer className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-80 lg:col-span-2" />
        <Shimmer className="h-80" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
