import { Shimmer } from "@/components/common/skeletons";

export default function AdminAppControlLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Shimmer className="h-96 rounded-xl" />
        <Shimmer className="h-96 rounded-xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
