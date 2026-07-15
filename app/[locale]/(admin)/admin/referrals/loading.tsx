import { Shimmer, StatCardSkeleton } from "@/components/common/skeletons";

export default function AdminReferralsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <Shimmer className="h-[24rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
