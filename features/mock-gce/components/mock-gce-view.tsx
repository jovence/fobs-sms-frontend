"use client";

import { useTranslations } from "next-intl";
import { Calendar, SearchX } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Shimmer } from "@/components/common/skeletons";
import { Reveal } from "@/components/common/motion";
import { useMockGceIndex } from "../hooks";
import { MockGceClassCard } from "./mock-gce-class-card";
import { MockGceInfoPanel } from "./mock-gce-info-panel";

export function MockGceView() {
  const t = useTranslations("mockGce");
  const { data, isLoading, isError, refetch } = useMockGceIndex();

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label={t("loading")}>
        <Shimmer className="h-24 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Shimmer key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
        <span className="sr-only">{t("loading")}</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("error.title")}
        description={t("error.description")}
        onRetry={() => refetch()}
        retryLabel={t("error.retry")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-[var(--shadow-xs)]">
          <Calendar className="size-4 text-primary" />
          {data.academicYear || "—"}
        </span>
      </div>

      <MockGceInfoPanel
        academicYear={data.academicYear}
        hasSequenceSixExam={data.hasSequenceSixExam}
      />

      {data.classes.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {data.classes.map((cls, i) => (
            <Reveal key={cls.id} delay={i * 0.05}>
              <MockGceClassCard cls={cls} />
            </Reveal>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
