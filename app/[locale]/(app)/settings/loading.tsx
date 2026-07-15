import { Shimmer } from "@/components/common/skeletons";

export default function SettingsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading settings">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-72" />
      </div>
      <Shimmer className="h-9 w-full max-w-xl rounded-lg" />
      <Shimmer className="h-[24rem] w-full rounded-xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
