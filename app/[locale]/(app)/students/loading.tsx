import { Shimmer } from "@/components/common/skeletons";

export default function StudentsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading students">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Shimmer className="h-9 w-64" />
        <Shimmer className="h-9 w-36" />
        <Shimmer className="h-9 w-32" />
        <Shimmer className="ml-auto h-9 w-28" />
      </div>
      <Shimmer className="h-[28rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
