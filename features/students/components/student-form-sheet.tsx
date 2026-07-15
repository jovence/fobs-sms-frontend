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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateStudent, useUpdateStudent } from "../hooks";
import { studentSchema, type StudentValues } from "../schemas";
import type { ClassOption, Student } from "../types";

const EMPTY: StudentValues = {
  fullName: "",
  matricule: "",
  gender: "Male",
  dateOfBirth: "",
  placeOfBirth: "",
  classId: "",
  guardianName: "",
  isRepeater: false,
  status: "Pending",
};

export function StudentFormSheet({
  open,
  onOpenChange,
  student,
  classes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  classes: ClassOption[];
}) {
  const t = useTranslations("students.form");
  const tv = useTranslations("validation");
  const tt = useTranslations("students.toasts");
  const create = useCreateStudent();
  const update = useUpdateStudent();
  const isEdit = !!student;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentValues>({
    resolver: zodResolver(studentSchema(tv)),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      student
        ? {
            fullName: student.fullName,
            matricule: student.matricule ?? "",
            gender: student.gender,
            dateOfBirth: student.dateOfBirth.slice(0, 10),
            placeOfBirth: student.placeOfBirth,
            classId: student.classId,
            guardianName: student.guardianName ?? "",
            isRepeater: student.isRepeater,
            status: student.status,
          }
        : EMPTY,
    );
  }, [open, student, reset]);

  async function onSubmit(values: StudentValues) {
    try {
      if (isEdit && student) {
        await update.mutateAsync({ id: student.id, input: values });
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
            <Field id="fullName" label={t("fullName")} error={errors.fullName?.message}>
              <Input id="fullName" autoComplete="off" aria-invalid={!!errors.fullName} {...register("fullName")} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="matricule" label={t("matricule")} optional>
                <Input id="matricule" autoComplete="off" {...register("matricule")} />
              </Field>
              <Field id="gender" label={t("gender")} error={errors.gender?.message}>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t("male")}</SelectItem>
                        <SelectItem value="Female">{t("female")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="dateOfBirth" label={t("dob")} error={errors.dateOfBirth?.message}>
                <Input id="dateOfBirth" type="date" aria-invalid={!!errors.dateOfBirth} {...register("dateOfBirth")} />
              </Field>
              <Field id="placeOfBirth" label={t("placeOfBirth")} error={errors.placeOfBirth?.message}>
                <Input id="placeOfBirth" autoComplete="off" aria-invalid={!!errors.placeOfBirth} {...register("placeOfBirth")} />
              </Field>
            </div>

            <Field id="classId" label={t("class")} error={errors.classId?.message}>
              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="classId" className="w-full">
                      <SelectValue placeholder={t("selectClass")} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field id="guardianName" label={t("guardian")} optional>
              <Input id="guardianName" autoComplete="off" {...register("guardianName")} />
            </Field>

            {isEdit && (
              <Field id="status" label={t("status")}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">{t("statusPending")}</SelectItem>
                        <SelectItem value="Approved">{t("statusApproved")}</SelectItem>
                        <SelectItem value="Rejected">{t("statusRejected")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}

            <Controller
              control={control}
              name="isRepeater"
              render={({ field }) => (
                <label className="flex items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                  {t("repeater")}
                </label>
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

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("students.form");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {t("optional")}
          </span>
        )}
      </Label>
      {children}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
