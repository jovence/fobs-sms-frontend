import { Shimmer } from "@/components/common/skeletons";

export default function StudentDetailLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading student">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-24" />
        <Shimmer className="h-8 w-24" />
      </div>
      <Shimmer className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-56 rounded-xl" />
        <Shimmer className="h-56 rounded-xl" />
        <Shimmer className="h-56 rounded-xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
