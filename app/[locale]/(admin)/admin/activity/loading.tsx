import { Shimmer } from "@/components/common/skeletons";

export default function AdminActivityLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-9 w-64" />
        <Shimmer className="h-9 w-36" />
      </div>
      <Shimmer className="h-[28rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
