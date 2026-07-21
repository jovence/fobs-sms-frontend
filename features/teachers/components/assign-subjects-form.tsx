"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, PlusCircle, Save } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { cn } from "@/lib/utils";
import { useAssignSubjects, useTeacherAssignSubjectsForm } from "../hooks";

export function AssignSubjectsForm({ teacherId }: { teacherId: string }) {
  const t = useTranslations("teachers");
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useTeacherAssignSubjectsForm(teacherId);
  const assign = useAssignSubjects(teacherId);

  // Derived selection: seeded from the server's assigned ids, then owned by local edits.
  const [selected, setSelected] = useState<Set<string> | null>(null);

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

  const current = selected ?? new Set(data.assignedSubjectIds);
  const assignedNames = data.availableSubjects.filter((s) => current.has(s.id));

  function toggle(id: string, checked: boolean) {
    const next = new Set(current);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  async function save() {
    await assign.mutateAsync([...current]);
    toast.success(t("assign.subjectsSaved"));
    router.push(`/teachers/${teacherId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("assign.subjectsTitle")}
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
            <BookOpen className="size-4 text-primary" /> {t("assign.currentSubjects")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedNames.map((s) => (
                <span
                  key={s.id}
                  className="rounded-lg border bg-muted/40 px-3 py-1.5 text-sm font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("assign.noSubjects")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="size-4 text-primary" /> {t("assign.availableSubjects")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.availableSubjects.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.availableSubjects.map((s) => {
                const checked = current.has(s.id);
                return (
                  <label
                    key={s.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                      checked && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={checked}
                      onCheckedChange={(v) => toggle(s.id, v === true)}
                    />
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-sm font-medium">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {[s.code, s.level, s.series].filter(Boolean).join(" • ") || "—"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen className="size-6" />}
              title={t("assign.noAvailableSubjects")}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={assign.isPending}>
          <Save /> {t("assign.save")}
        </Button>
      </div>
    </div>
  );
}
