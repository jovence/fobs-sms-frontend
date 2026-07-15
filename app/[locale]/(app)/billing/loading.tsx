import { Shimmer } from "@/components/common/skeletons";

export default function BillingLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading billing">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-72" />
      </div>
      <Shimmer className="h-48 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Shimmer className="h-72 rounded-2xl" />
        <Shimmer className="h-72 rounded-2xl" />
        <Shimmer className="h-72 rounded-2xl" />
      </div>
      <Shimmer className="h-[24rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
