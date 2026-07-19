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
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSubject, useUpdateSubject } from "../hooks";
import { subjectSchema, type SubjectValues } from "../schemas";
import type { Subject } from "../types";

const EMPTY: SubjectValues = { name: "", code: "", series: "both" };

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
  const tv = useTranslations("validation");
  const tt = useTranslations("academics.toasts");
  const create = useCreateSubject();
  const update = useUpdateSubject();
  const isEdit = !!subject;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectValues>({
    resolver: zodResolver(subjectSchema(tv)),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      subject
        ? { name: subject.name, code: subject.code, series: subject.series }
        : EMPTY,
    );
  }, [open, subject, reset]);

  async function onSubmit(values: SubjectValues) {
    try {
      if (isEdit && subject) {
        await update.mutateAsync({ id: subject.id, input: values });
        toast.success(tt("subjectUpdated"));
      } else {
        await create.mutateAsync(values);
        toast.success(tt("subjectCreated"));
      }
      onOpenChange(false);
    } catch {
      toast.error(tt("error"));
    }
  }

  const busy = create.isPending || update.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
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
