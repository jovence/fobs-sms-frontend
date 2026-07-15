import { Shimmer } from "@/components/common/skeletons";

export default function ReportsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading reports">
      <div className="space-y-2">
        <Shimmer className="h-7 w-48" />
        <Shimmer className="h-4 w-80" />
      </div>
      <Shimmer className="h-8 w-64 rounded-lg" />
      <Shimmer className="h-28 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <Shimmer className="h-[24rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
