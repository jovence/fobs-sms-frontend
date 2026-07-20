import { Shimmer } from "@/components/common/skeletons";

export default function TeacherProfileLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading teacher">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-24" />
        <Shimmer className="h-8 w-56" />
      </div>
      <Shimmer className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Shimmer className="h-28 rounded-xl" />
        <Shimmer className="h-28 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-48 rounded-xl" />
        <Shimmer className="h-48 rounded-xl" />
        <Shimmer className="h-48 rounded-xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
