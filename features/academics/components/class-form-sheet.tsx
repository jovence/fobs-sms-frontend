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
import { useCreateClass, useTeacherOptions, useUpdateClass } from "../hooks";
import { classSchema, type ClassValues } from "../schemas";
import type { SchoolClass, SchoolClassInput } from "../types";

/** Sentinel Select value for "no class master" (Radix forbids an empty-string item value). */
const NONE = "none";

const EMPTY: ClassValues = {
  name: "",
  level: "lower",
  section: "english",
  classMasterId: "",
};

export function ClassFormSheet({
  open,
  onOpenChange,
  schoolClass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolClass: SchoolClass | null;
}) {
  const t = useTranslations("academics.classForm");
  const tv = useTranslations("validation");
  const tt = useTranslations("academics.toasts");
  const create = useCreateClass();
  const update = useUpdateClass();
  const teachers = useTeacherOptions();
  const isEdit = !!schoolClass;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassValues>({
    resolver: zodResolver(classSchema(tv)),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      schoolClass
        ? {
            name: schoolClass.name,
            level: schoolClass.level,
            section: schoolClass.section,
            classMasterId: schoolClass.classMasterId ?? "",
          }
        : EMPTY,
    );
  }, [open, schoolClass, reset]);

  async function onSubmit(values: ClassValues) {
    const master = teachers.data?.find((o) => o.id === values.classMasterId);
    const input: SchoolClassInput = {
      name: values.name,
      level: values.level,
      section: values.section,
      classMasterId: values.classMasterId || null,
      classMasterName: master?.name ?? null,
    };
    try {
      if (isEdit && schoolClass) {
        await update.mutateAsync({ id: schoolClass.id, input });
        toast.success(tt("classUpdated"));
      } else {
        await create.mutateAsync(input);
        toast.success(tt("classCreated"));
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
              {(aria) => (
                <Input
                  placeholder={t("namePlaceholder")}
                  {...aria}
                  {...register("name")}
                />
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">{t("level")}</Label>
                <Controller
                  control={control}
                  name="level"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="level" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lower">{t("levelLower")}</SelectItem>
                        <SelectItem value="upper">{t("levelUpper")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">{t("section")}</Label>
                <Controller
                  control={control}
                  name="section"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="section" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">{t("sectionEnglish")}</SelectItem>
                        <SelectItem value="french">{t("sectionFrench")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classMaster">
                {t("master")}
                <span className="text-muted-foreground ml-1 text-xs font-normal">
                  {t("optional")}
                </span>
              </Label>
              <Controller
                control={control}
                name="classMasterId"
                render={({ field }) => (
                  <Select
                    value={field.value ? field.value : NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    disabled={teachers.isLoading}
                  >
                    <SelectTrigger id="classMaster" className="w-full">
                      <SelectValue placeholder={t("masterPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t("masterNone")}</SelectItem>
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
