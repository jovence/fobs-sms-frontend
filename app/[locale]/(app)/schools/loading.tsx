import { Shimmer } from "@/components/common/skeletons";

export default function SchoolsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading schools">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
