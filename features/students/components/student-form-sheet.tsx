"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  GraduationCap,
  IdCard,
  ImageIcon,
  Loader2,
  RotateCcw,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { ApiError } from "@/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_SECTIONS, classLabel, classesBySection } from "@/features/academics/class-options";
import { useCreateStudent, useUpdateStudent } from "../hooks";
import { studentSchema, type StudentValues } from "../schemas";
import type { ClassOption, Student } from "../types";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png"];

const backendFieldMap: Record<string, keyof StudentValues | "image"> = {
  full_name: "fullName",
  matricule: "matricule",
  date_of_birth: "dateOfBirth",
  place_of_birth: "placeOfBirth",
  gender: "gender",
  class_id: "classId",
  repeater: "isRepeater",
  image: "image",
};

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoObjectUrl, setPhotoObjectUrl] = useState<string | null>(null);
  const [photoCleared, setPhotoCleared] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<StudentValues>({
    resolver: zodResolver(studentSchema(tv)),
    defaultValues: EMPTY,
  });

  function resetPhotoState() {
    setPhotoFile(null);
    setPhotoObjectUrl(null);
    setPhotoCleared(false);
    setPhotoError(null);
    setFormError(null);
    setPhotoInputKey((key) => key + 1);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetPhotoState();
    onOpenChange(nextOpen);
  }

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

  useEffect(() => {
    if (!photoObjectUrl) return;
    return () => URL.revokeObjectURL(photoObjectUrl);
  }, [photoObjectUrl]);

  function onPhotoChange(file: File | null) {
    setPhotoError(null);

    if (!file) {
      setPhotoFile(null);
      setPhotoObjectUrl(null);
      return;
    }

    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoFile(null);
      setPhotoObjectUrl(null);
      setPhotoError(t("photoTypeError"));
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoFile(null);
      setPhotoObjectUrl(null);
      setPhotoError(t("photoSizeError"));
      return;
    }

    setPhotoFile(file);
    setPhotoObjectUrl(URL.createObjectURL(file));
    setPhotoCleared(false);
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoObjectUrl(null);
    setPhotoCleared(true);
    setPhotoError(null);
    setPhotoInputKey((key) => key + 1);
  }

  function mapBackendErrors(err: unknown) {
    if (!(err instanceof ApiError) || !err.fields) return;

    for (const [backendField, message] of Object.entries(err.fields)) {
      const formField = backendFieldMap[backendField];
      if (!formField) continue;
      if (formField === "image") setPhotoError(message);
      else setError(formField, { message });
    }
  }

  function studentErrorMessage(err: unknown): string {
    if (!(err instanceof ApiError)) return tt("error");
    if (err.code === "network") return t("networkError");
    if (err.code === "validation" || err.status === 422) return t("validationError");
    if (err.status >= 500) return t("backendError", { status: err.status });
    return err.message || tt("error");
  }

  async function onSubmit(values: StudentValues) {
    setFormError(null);
    setPhotoError(null);
    try {
      const input = { ...values, image: photoFile };
      if (isEdit && student) {
        await update.mutateAsync({ id: student.id, input });
        toast.success(tt("updated"));
      } else {
        await create.mutateAsync(input);
        toast.success(tt("created"));
      }
      handleOpenChange(false);
    } catch (err) {
      mapBackendErrors(err);
      const message = studentErrorMessage(err);
      setFormError(message);
      toast.error(message);
    }
  }

  const busy = create.isPending || update.isPending;
  const photoPreview = photoObjectUrl ?? (photoCleared ? null : student?.photoUrl ?? null);
  const groupedClasses = classesBySection(classes);
  const classLabels = {
    lower: t("levelLower"),
    upper: t("levelUpper"),
    english: t("sectionEnglish"),
    french: t("sectionFrench"),
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b bg-gradient-to-r from-primary/10 via-sky-50 to-emerald-50 px-6 py-5">
          <div className="flex items-start gap-4 pr-10">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-xl">
                {isEdit ? t("editTitle") : t("createTitle")}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {isEdit ? t("editSubtitle") : t("createSubtitle")}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="flex-1 space-y-5 overflow-y-auto bg-muted/20 px-6 py-6">
            {formError && (
              <Alert variant="destructive" aria-live="assertive">
                <AlertCircle className="size-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <section className="overflow-hidden rounded-lg border bg-background shadow-xs">
              <div className="flex items-center gap-3 border-b bg-muted/35 px-5 py-4">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Camera className="size-4" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t("photoTitle")}</h3>
                  <p className="text-xs text-muted-foreground">{t("photoDescription")}</p>
                </div>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[8rem_1fr] sm:items-center">
                <div className="relative size-32 overflow-hidden rounded-2xl border bg-muted shadow-inner">
                  {photoPreview ? (
                    <div
                      role="img"
                      aria-label={t("photoPreviewAlt")}
                      style={{ backgroundImage: `url(${photoPreview})` }}
                      className="size-full bg-cover bg-center"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-muted-foreground">
                      <UserRound className="size-12" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    key={photoInputKey}
                    id="student-photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="student-photo">
                        <Upload /> {t("photoUpload")}
                      </label>
                    </Button>
                    {(photoFile || photoPreview) && (
                      <Button type="button" variant="ghost" onClick={clearPhoto}>
                        <X /> {t("photoClear")}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ImageIcon className="size-3.5" /> {t("photoHint")}
                    </span>
                    {photoFile && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        {t("photoSelected", { name: photoFile.name })}
                      </span>
                    )}
                  </div>
                  {photoError && (
                    <p role="alert" className="text-sm text-destructive">
                      {photoError}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border bg-background shadow-xs">
              <div className="flex items-center gap-3 border-b bg-sky-50 px-5 py-4">
                <div className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white">
                  <IdCard className="size-4" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t("identityTitle")}</h3>
                  <p className="text-xs text-muted-foreground">{t("identityDescription")}</p>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <Field id="fullName" label={t("fullName")} error={errors.fullName?.message}>
                  {(aria) => <Input autoComplete="off" {...aria} {...register("fullName")} />}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="matricule" label={t("matricule")} optionalLabel={t("optional")}>
                    <Input id="matricule" autoComplete="off" {...register("matricule")} />
                  </Field>
                  <Field id="gender" label={t("gender")} error={errors.gender?.message}>
                    {(aria) => (
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger {...aria} className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">{t("male")}</SelectItem>
                              <SelectItem value="Female">{t("female")}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="dateOfBirth"
                    label={t("dob")}
                    error={errors.dateOfBirth?.message}
                  >
                    {(aria) => <Input type="date" {...aria} {...register("dateOfBirth")} />}
                  </Field>
                  <Field
                    id="placeOfBirth"
                    label={t("placeOfBirth")}
                    error={errors.placeOfBirth?.message}
                  >
                    {(aria) => (
                      <Input autoComplete="off" {...aria} {...register("placeOfBirth")} />
                    )}
                  </Field>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border bg-background shadow-xs">
              <div className="flex items-center gap-3 border-b bg-amber-50 px-5 py-4">
                <div className="grid size-9 place-items-center rounded-lg bg-amber-600 text-white">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t("assignmentTitle")}</h3>
                  <p className="text-xs text-muted-foreground">{t("assignmentDescription")}</p>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <Field id="classId" label={t("class")} error={errors.classId?.message}>
                  {(aria) => (
                    <Controller
                      control={control}
                      name="classId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger {...aria} className="w-full">
                            <SelectValue placeholder={t("selectClass")} />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASS_SECTIONS.map((section) => {
                              const rows = groupedClasses[section];
                              if (rows.length === 0) return null;
                              return (
                                <SelectGroup key={section}>
                                  <SelectLabel>{classLabels[section]}</SelectLabel>
                                  {rows.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {classLabel(c, classLabels)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              );
                            })}
                            {groupedClasses.other.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>{t("sectionUnknown")}</SelectLabel>
                                {groupedClasses.other.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {classLabel(c, classLabels)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </Field>

                <Field id="guardianName" label={t("guardian")} optionalLabel={t("optional")}>
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
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border bg-muted/25 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                      <RotateCcw className="size-4 text-muted-foreground" />
                      {t("repeater")}
                    </label>
                  )}
                />
              </div>
            </section>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t bg-background">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
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
