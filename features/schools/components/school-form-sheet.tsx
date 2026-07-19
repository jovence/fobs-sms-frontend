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
import { Field } from "@/components/ui/field";
import { useCreateSchool, useUpdateSchool } from "../hooks";
import { schoolSchema, type SchoolValues } from "../schemas";
import type { School } from "@/types";

const EMPTY: SchoolValues = { name: "", acronym: "", email: "", phone: "", address: "" };

export function SchoolFormSheet({
  open,
  onOpenChange,
  school,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
}) {
  const t = useTranslations("schools.form");
  const tv = useTranslations("validation");
  const tt = useTranslations("schools.toasts");
  const create = useCreateSchool();
  const update = useUpdateSchool();
  const isEdit = !!school;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchoolValues>({
    resolver: zodResolver(schoolSchema(tv)),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      school
        ? {
            name: school.name,
            acronym: school.acronym,
            email: school.email ?? "",
            phone: school.phone ?? "",
            address: school.address ?? "",
          }
        : EMPTY,
    );
  }, [open, school, reset]);

  async function onSubmit(values: SchoolValues) {
    try {
      if (isEdit && school) {
        await update.mutateAsync({ id: school.id, input: values });
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
            <Field id="acronym" label={t("acronym")} error={errors.acronym?.message}>
              {(aria) => (
                <Input
                  className="uppercase"
                  maxLength={6}
                  {...aria}
                  {...register("acronym")}
                />
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="email"
                label={t("email")}
                error={errors.email?.message}
                optionalLabel={t("optional")}
              >
                {(aria) => <Input type="email" {...aria} {...register("email")} />}
              </Field>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("phone")}
                  <span className="text-muted-foreground ml-1 text-xs font-normal">
                    {t("optional")}
                  </span>
                </Label>
                <Input id="phone" type="tel" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                {t("address")}
                <span className="text-muted-foreground ml-1 text-xs font-normal">
                  {t("optional")}
                </span>
              </Label>
              <Input id="address" {...register("address")} />
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
