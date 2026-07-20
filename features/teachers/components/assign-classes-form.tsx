"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, PlusCircle, Save, TriangleAlert, Users, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState, LoadingState } from "@/components/common/states";
import { cn } from "@/lib/utils";
import {
  useAssignClasses,
  useRemoveTeacherClass,
  useTeacherAssignClassesForm,
} from "../hooks";
import type { AssignClassSubjectGroup, AssignedClass, ClassAssignmentInput } from "../types";

/** The editable checkbox grid — remounted (via `key`) whenever the server selection changes. */
function ClassSelection({
  teacherId,
  groups,
}: {
  teacherId: string;
  groups: AssignClassSubjectGroup[];
}) {
  const t = useTranslations("teachers");
  const router = useRouter();
  const assign = useAssignClasses(teacherId);

  const [selection, setSelection] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    for (const g of groups) initial[g.subjectId] = new Set(g.assignedClassIds);
    return initial;
  });

  function toggle(subjectId: string, classId: string, checked: boolean) {
    setSelection((prev) => {
      const next = new Set(prev[subjectId] ?? []);
      if (checked) next.add(classId);
      else next.delete(classId);
      return { ...prev, [subjectId]: next };
    });
  }

  async function save() {
    const assignments: ClassAssignmentInput[] = groups.map((g) => ({
      subjectId: g.subjectId,
      classIds: [...(selection[g.subjectId] ?? [])],
    }));
    await assign.mutateAsync(assignments);
    toast.success(t("assign.classesSaved"));
    router.push(`/teachers/${teacherId}`);
  }

  if (groups.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-1 text-foreground/80">
          <p className="font-medium text-warning">{t("assign.noClassesTitle")}</p>
          <ul className="list-disc space-y-0.5 pl-5">
            <li>{t("assign.noClassesReason1")}</li>
            <li>{t("assign.noClassesReason2")}</li>
            <li>{t("assign.noClassesReason3")}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.subjectId} className="rounded-xl border p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-primary" /> {g.subjectName}
            </h3>
            {g.classes.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.classes.map((c) => {
                  const checked = selection[g.subjectId]?.has(c.id) ?? false;
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                        checked && "border-primary/40 bg-primary/5",
                      )}
                    >
                      <Checkbox
                        className="mt-0.5"
                        checked={checked}
                        onCheckedChange={(v) => toggle(g.subjectId, c.id, v === true)}
                      />
                      <span className="min-w-0 space-y-0.5">
                        <span className="block text-sm font-medium">{c.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {[c.level, c.academicYear].filter(Boolean).join(" • ") || "—"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("assign.noSubjectClasses")}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={assign.isPending}>
          <Save /> {t("assign.save")}
        </Button>
      </div>
    </>
  );
}

export function AssignClassesForm({ teacherId }: { teacherId: string }) {
  const t = useTranslations("teachers");
  const { data, isLoading, isError, refetch } = useTeacherAssignClassesForm(teacherId);
  const removeClass = useRemoveTeacherClass(teacherId);
  const [classTarget, setClassTarget] = useState<AssignedClass | null>(null);

  if (isLoading) return <LoadingState label={t("assign.loading")} />;
  if (isError || !data) {
    return (
      <ErrorState
        title={t("assign.errorTitle")}
        description={t("assign.errorDescription")}
        onRetry={() => refetch()}
      />
    );
  }

  // Reset the checkbox grid's local state whenever the server selection changes (e.g. a
  // class is removed) — React 19 bans syncing that with set-state-in-effect.
  const version = data.subjects
    .map((g) => `${g.subjectId}:${[...g.assignedClassIds].sort().join(",")}`)
    .join("|");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("assign.classesTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("assign.forTeacher", { name: data.teacherName })}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/teachers/${teacherId}`}>
            <ArrowLeft /> {t("assign.backToProfile")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" /> {t("assign.currentClasses")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.assignedClasses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.assignedClasses.map((c) => (
                <span
                  key={c.id}
                  className="flex items-center gap-2 rounded-lg border bg-muted/40 py-1.5 pr-1.5 pl-3 text-sm font-medium"
                >
                  {c.name}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t("assign.removeClass")}
                    onClick={() => setClassTarget(c)}
                  >
                    <X />
                  </Button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("assign.noClasses")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="size-4 text-primary" /> {t("assign.availableClasses")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ClassSelection key={version} teacherId={teacherId} groups={data.subjects} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!classTarget}
        onOpenChange={(o) => !o && setClassTarget(null)}
        title={t("assign.removeClassTitle")}
        description={t("assign.removeClassDescription", { name: classTarget?.name ?? "" })}
        confirmLabel={t("assign.removeClass")}
        cancelLabel={t("form.cancel")}
        destructive
        isPending={removeClass.isPending}
        onConfirm={async () => {
          if (!classTarget) return;
          await removeClass.mutateAsync(classTarget.id);
          toast.success(t("assign.classRemoved"));
          setClassTarget(null);
        }}
      />
    </div>
  );
}
