"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/common/states";
import { Shimmer } from "@/components/common/skeletons";
import { Reveal } from "@/components/common/motion";
import { useAppUpdates } from "../hooks";
import { AppControlCard } from "./app-control-card";

export function AppControl() {
  const t = useTranslations("adminAppControl");
  const { data, isLoading, isError, refetch } = useAppUpdates();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Shimmer className="h-96 rounded-xl" />
        <Shimmer className="h-96 rounded-xl" />
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorState title={t("errorTitle")} description={t("errorDescription")} onRetry={() => refetch()} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Reveal>
        <AppControlCard settings={data.teacher} />
      </Reveal>
      <Reveal delay={0.08}>
        <AppControlCard settings={data.parent} />
      </Reveal>
    </div>
  );
}
