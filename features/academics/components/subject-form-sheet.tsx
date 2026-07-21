"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useClassOptions,
  useCreateSubject,
  useSubjectAssignments,
  useTeacherOptions,
  useUpdateSubject,
} from "../hooks";
import { classLabel } from "../class-options";
import { subjectSchema, type SubjectValues } from "../schemas";
import type { ClassOption } from "../api/academics.service";
import type { Subject, SubjectClassAssignment, SubjectInput } from "../types";

/** Sentinel Select value for "no teacher" (Radix forbids an empty-string item value). */
const NONE = "none";
const DEFAULT_COEFFICIENT = 1;
const DEFAULT_WEEKLY_HOURS = 2;

const EMPTY: SubjectValues = { name: "", code: "", series: "both", classes: [] };

/** Build one form row per class, pre-checking + prefilling any existing assignment. */
function buildRows(
  classes: ClassOption[],
  assignments: SubjectClassAssignment[],
): SubjectClassAssignment[] {
  const byId = new Map(assignments.map((a) => [a.classId, a]));
  return classes.map((c) => {
    const existing = byId.get(c.id);
    return {
      classId: c.id,
      assigned: !!existing,
      coefficient: existing?.coefficient ?? DEFAULT_COEFFICIENT,
      minWeeklyHours: existing?.minWeeklyHours ?? DEFAULT_WEEKLY_HOURS,
      teacherId: existing?.teacherId ?? null,
    };
  });
}

export function SubjectFormSheet({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
}) {
  const t = useTranslations("academics.subjectForm");
  const tc = useTranslations("academics.classForm");
  const tv = useTranslations("validation");
  const tt = useTranslations("academics.toasts");
  const create = useCreateSubject();
  const update = useUpdateSubject();
  const classOptions = useClassOptions();
  const teachers = useTeacherOptions();
  const assignments = useSubjectAssignments(open && subject ? subject.id : undefined);
  const isEdit = !!subject;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SubjectValues>({
    resolver: zodResolver(subjectSchema(tv)),
    defaultValues: EMPTY,
  });

  const { fields } = useFieldArray({ control, name: "classes" });

  const classNames = useMemo(
    () => {
      const labels = {
        lower: tc("levelLower"),
        upper: tc("levelUpper"),
        english: tc("sectionEnglish"),
        french: tc("sectionFrench"),
      };
      return new Map((classOptions.data ?? []).map((c) => [c.id, classLabel(c, labels)]));
    },
    [classOptions.data, tc],
  );

  // Wait for the class list (and, when editing, the existing assignments) before seeding the form.
  const classData = classOptions.data;
  const assignmentData = assignments.data;
  const assignmentsReady = !isEdit || !assignments.isLoading;

  useEffect(() => {
    if (!open || !classData || !assignmentsReady) return;
    reset({
      name: subject?.name ?? "",
      code: subject?.code ?? "",
      series: subject?.series ?? "both",
      classes: buildRows(classData, assignmentData ?? []),
    });
  }, [open, subject, classData, assignmentData, assignmentsReady, reset]);

  const watchedClasses = useWatch({ control, name: "classes" });

  async function onSubmit(values: SubjectValues) {
    if (!values.classes.some((c) => c.assigned)) {
      setError("classes", { type: "manual", message: t("classesRequired") });
      return;
    }
    const input: SubjectInput = {
      name: values.name,
      code: values.code,
      series: values.series,
      classes: values.classes,
    };
    try {
      if (isEdit && subject) {
        await update.mutateAsync({ id: subject.id, input });
        toast.success(tt("subjectUpdated"));
      } else {
        await create.mutateAsync(input);
        toast.success(tt("subjectCreated"));
      }
      onOpenChange(false);
    } catch {
      toast.error(tt("error"));
    }
  }

  const busy = create.isPending || update.isPending;
  const noClasses = !classOptions.isLoading && (classOptions.data?.length ?? 0) === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
          <SheetDescription>
            {isEdit ? t("editSubtitle") : t("createSubtitle")}
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <Field id="name" label={t("name")} error={errors.name?.message}>
              {(aria) => <Input {...aria} {...register("name")} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="code" label={t("code")} error={errors.code?.message}>
                {(aria) => (
                  <Input
                    className="font-mono uppercase"
                    {...aria}
                    {...register("code")}
                  />
                )}
              </Field>
              <div className="space-y-2">
                <Label htmlFor="series">{t("series")}</Label>
                <Controller
                  control={control}
                  name="series"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="series" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science">{t("seriesScience")}</SelectItem>
                        <SelectItem value="art">{t("seriesArt")}</SelectItem>
                        <SelectItem value="both">{t("seriesBoth")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label>{t("classesLabel")}</Label>
                <span className="text-muted-foreground text-xs">{t("classesHint")}</span>
              </div>
              {errors.classes?.message && (
                <p role="alert" className="text-destructive text-sm">
                  {errors.classes.message}
                </p>
              )}

              {noClasses ? (
                <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  {t("noClasses")}
                </p>
              ) : classOptions.isLoading || (isEdit && assignments.isLoading) ? (
                <div className="flex items-center justify-center rounded-lg border p-6 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              ) : (
                <div className="divide-y rounded-lg border">
                  {fields.map((f, i) => {
                    const assigned = watchedClasses?.[i]?.assigned;
                    return (
                      <div key={f.id} className="space-y-3 p-3">
                        <label className="flex items-center gap-2.5">
                          <Controller
                            control={control}
                            name={`classes.${i}.assigned`}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(v) => {
                                  field.onChange(!!v);
                                  clearErrors("classes");
                                }}
                              />
                            )}
                          />
                          <span className="text-sm font-medium">
                            {classNames.get(f.classId) ?? f.classId}
                          </span>
                        </label>
                        {assigned && (
                          <div className="grid gap-3 pl-7 sm:grid-cols-3">
                            <div className="space-y-1.5">
                              <Label
                                htmlFor={`coefficient-${i}`}
                                className="text-xs text-muted-foreground"
                              >
                                {t("coefficient")}
                              </Label>
                              <Input
                                id={`coefficient-${i}`}
                                type="number"
                                min={0.5}
                                max={10}
                                step={0.5}
                                aria-invalid={
                                  errors.classes?.[i]?.coefficient ? true : undefined
                                }
                                {...register(`classes.${i}.coefficient`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                htmlFor={`hours-${i}`}
                                className="text-xs text-muted-foreground"
                              >
                                {t("weeklyHours")}
                              </Label>
                              <Input
                                id={`hours-${i}`}
                                type="number"
                                min={1}
                                max={20}
                                step={1}
                                aria-invalid={
                                  errors.classes?.[i]?.minWeeklyHours ? true : undefined
                                }
                                {...register(`classes.${i}.minWeeklyHours`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                htmlFor={`teacher-${i}`}
                                className="text-xs text-muted-foreground"
                              >
                                {t("teacher")}
                              </Label>
                              <Controller
                                control={control}
                                name={`classes.${i}.teacherId`}
                                render={({ field }) => (
                                  <Select
                                    value={field.value ? field.value : NONE}
                                    onValueChange={(v) =>
                                      field.onChange(v === NONE ? null : v)
                                    }
                                    disabled={teachers.isLoading}
                                  >
                                    <SelectTrigger id={`teacher-${i}`} size="sm" className="w-full">
                                      <SelectValue placeholder={t("teacherNone")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={NONE}>{t("teacherNone")}</SelectItem>
                                      {teachers.data?.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                          {teacher.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("save") : t("create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
