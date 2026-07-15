import { Shimmer } from "@/components/common/skeletons";

export default function AcademicsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Shimmer className="h-7 w-48" />
        <Shimmer className="h-4 w-72" />
      </div>
      <Shimmer className="h-9 w-56" />
      <Shimmer className="h-[26rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
