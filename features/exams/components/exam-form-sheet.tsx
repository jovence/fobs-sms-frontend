"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateExam, useUpdateExam } from "../hooks";
import { examSchema, type ExamValues } from "../schemas";
import type { Exam } from "../types";

const EMPTY: ExamValues = {
  name: "",
  term: "First",
  sequence: 1,
  published: false,
  markEntryAllowed: true,
};

export function ExamFormSheet({
  open,
  onOpenChange,
  exam,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Exam | null;
}) {
  const t = useTranslations("exams.form");
  const tv = useTranslations("validation");
  const tt = useTranslations("exams.toasts");
  const create = useCreateExam();
  const update = useUpdateExam();
  const isEdit = !!exam;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExamValues>({
    resolver: zodResolver(examSchema(tv)),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      exam
        ? {
            name: exam.name,
            term: exam.term,
            sequence: exam.sequence,
            published: exam.published,
            markEntryAllowed: exam.markEntryAllowed,
          }
        : EMPTY,
    );
  }, [open, exam, reset]);

  async function onSubmit(values: ExamValues) {
    try {
      if (isEdit && exam) {
        await update.mutateAsync({ id: exam.id, input: values });
        toast.success(tt("updated"));
      } else {
        await create.mutateAsync(values);
        toast.success(tt("created"));
      }
      onOpenChange(false);
    } catch {
      toast.error(tt("error"));
    }
  }

  const busy = create.isPending || update.isPending;

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
              {(aria) => (
                <Input
                  autoComplete="off"
                  placeholder={t("namePlaceholder")}
                  {...aria}
                  {...register("name")}
                />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="term" label={t("term")} error={errors.term?.message}>
                {(aria) => (
                  <Controller
                    control={control}
                    name="term"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger {...aria} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First">{t("termFirst")}</SelectItem>
                          <SelectItem value="Second">{t("termSecond")}</SelectItem>
                          <SelectItem value="Third">{t("termThird")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </Field>
              <Field
                id="sequence"
                label={t("sequence")}
                error={errors.sequence?.message}
                hint={t("sequenceHint")}
              >
                {(aria) => (
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    inputMode="numeric"
                    {...aria}
                    {...register("sequence", { valueAsNumber: true })}
                  />
                )}
              </Field>
            </div>

            <Controller
              control={control}
              name="published"
              render={({ field }) => (
                <ToggleRow
                  id="published"
                  label={t("published")}
                  description={t("publishedHint")}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="markEntryAllowed"
              render={({ field }) => (
                <ToggleRow
                  id="markEntryAllowed"
                  label={t("markEntry")}
                  description={t("markEntryHint")}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
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

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="bg-card flex items-center justify-between gap-4 rounded-lg border px-4 py-3 shadow-[var(--shadow-sm)]">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
