import { Shimmer } from "@/components/common/skeletons";

export default function ParentDetailLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading parent">
      <Shimmer className="h-8 w-24" />
      <Shimmer className="h-28 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Shimmer className="h-20 w-full rounded-xl" />
        <Shimmer className="h-20 w-full rounded-xl" />
        <Shimmer className="h-20 w-full rounded-xl" />
      </div>
      <Shimmer className="h-64 w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
