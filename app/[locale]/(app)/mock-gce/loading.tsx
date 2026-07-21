import { Shimmer } from "@/components/common/skeletons";

export default function MockGceLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading Mock GCE">
      <div className="space-y-2">
        <Shimmer className="h-7 w-56" />
        <Shimmer className="h-4 w-96 max-w-full" />
      </div>
      <Shimmer className="h-24 w-full rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Shimmer key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
