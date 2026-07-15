"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Shimmer } from "@/components/common/skeletons";
import { Reveal } from "@/components/common/motion";
import { useDeleteSchool, useSchools } from "../hooks";
import type { School } from "@/types";
import { SchoolCard } from "./school-card";
import { SchoolFormSheet } from "./school-form-sheet";

export function SchoolsGrid() {
  const t = useTranslations("schools");
  const { data, isLoading, isError, refetch } = useSchools();
  const remove = useDeleteSchool();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground tabular-nums">
          {data ? t("count", { count: data.length }) : ""}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus /> {t("add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title={t("errorTitle")} description={t("errorDescription")} onRetry={() => refetch()} />
      ) : data && data.length === 0 ? (
        <EmptyState
          title={t("empty.title")}
          description={t("empty.description")}
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus /> {t("add")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.map((school, i) => (
            <Reveal key={school.id} delay={i * 0.05}>
              <SchoolCard
                school={school}
                onEdit={(s) => {
                  setEditing(s);
                  setFormOpen(true);
                }}
                onDelete={(s) => setDeleteTarget(s)}
              />
            </Reveal>
          ))}
          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.03] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
              <Plus className="size-5" />
            </span>
            <span className="text-sm font-medium">{t("add")}</span>
          </button>
        </div>
      )}

      <SchoolFormSheet open={formOpen} onOpenChange={setFormOpen} school={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("actions.delete")}
        cancelLabel={t("form.cancel")}
        destructive
        isPending={remove.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove.mutateAsync(deleteTarget.id);
          toast.success(t("toasts.deleted"));
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
