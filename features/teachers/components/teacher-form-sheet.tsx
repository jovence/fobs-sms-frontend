"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useUpdateTeacher } from "../hooks";
import { teacherSchema, type TeacherValues } from "../schemas";
import type { Teacher } from "../types";

export function TeacherFormSheet({
  open,
  onOpenChange,
  teacher,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
}) {
  const t = useTranslations("teachers.form");
  const tv = useTranslations("validation");
  const tt = useTranslations("teachers.toasts");
  const update = useUpdateTeacher();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherValues>({
    resolver: zodResolver(teacherSchema(tv)),
  });

  useEffect(() => {
    if (open && teacher) {
      reset({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        specialization: teacher.specialization,
        qualifications: teacher.qualifications,
        experienceYears: teacher.experienceYears,
      });
    }
  }, [open, teacher, reset]);

  async function onSubmit(values: TeacherValues) {
    if (!teacher) return;
    try {
      await update.mutateAsync({ id: teacher.id, input: values });
      toast.success(tt("updated"));
      onOpenChange(false);
    } catch {
      toast.error(tt("error"));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{t("editTitle")}</SheetTitle>
          <SheetDescription>{t("editSubtitle")}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <Field id="name" label={t("name")} error={errors.name?.message}>
              <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="email" label={t("email")} error={errors.email?.message}>
                <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
              </Field>
              <Field id="phone" label={t("phone")} error={errors.phone?.message}>
                <Input id="phone" type="tel" aria-invalid={!!errors.phone} {...register("phone")} />
              </Field>
            </div>
            <Field id="specialization" label={t("specialization")} error={errors.specialization?.message}>
              <Input id="specialization" aria-invalid={!!errors.specialization} {...register("specialization")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="qualifications" label={t("qualifications")} error={errors.qualifications?.message}>
                <Input id="qualifications" aria-invalid={!!errors.qualifications} {...register("qualifications")} />
              </Field>
              <Field id="experienceYears" label={t("experience")} error={errors.experienceYears?.message}>
                <Input
                  id="experienceYears"
                  type="number"
                  min={0}
                  max={60}
                  aria-invalid={!!errors.experienceYears}
                  {...register("experienceYears", { valueAsNumber: true })}
                />
              </Field>
            </div>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
