import { Shimmer } from "@/components/common/skeletons";

export default function ExamDetailLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading exam">
      <Shimmer className="h-8 w-32" />
      <div className="space-y-2">
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-5 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Shimmer className="h-72 rounded-xl lg:col-span-2" />
        <Shimmer className="h-72 rounded-xl lg:col-span-3" />
      </div>
      <Shimmer className="h-80 w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
