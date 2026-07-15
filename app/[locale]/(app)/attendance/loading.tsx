import { Shimmer } from "@/components/common/skeletons";

export default function AttendanceLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading attendance">
      <div className="space-y-2">
        <Shimmer className="h-7 w-44" />
        <Shimmer className="h-4 w-80" />
      </div>
      <Shimmer className="h-8 w-56 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Shimmer className="h-16 rounded-xl" />
        <Shimmer className="h-16 rounded-xl" />
        <Shimmer className="h-16 rounded-xl" />
      </div>
      <Shimmer className="h-[26rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
