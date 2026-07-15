import { Shimmer } from "@/components/common/skeletons";

export default function ReferralsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading referrals">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-80" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-44 lg:col-span-1" />
        <Shimmer className="h-44" />
        <Shimmer className="h-44" />
      </div>
      <div className="space-y-2">
        <Shimmer className="h-6 w-44" />
        <Shimmer className="h-4 w-64" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Shimmer className="h-9 w-64" />
        <Shimmer className="h-9 w-36" />
      </div>
      <Shimmer className="h-[24rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
