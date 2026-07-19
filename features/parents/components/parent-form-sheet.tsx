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
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateParent, useUpdateParent } from "../hooks";
import { parentSchema, type ParentValues } from "../schemas";
import type { Parent } from "../types";

const EMPTY: ParentValues = {
  name: "",
  email: "",
  phone: "",
  occupation: "",
  address: "",
};

export function ParentFormSheet({
  open,
  onOpenChange,
  parent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent: Parent | null;
}) {
  const t = useTranslations("parents.form");
  const tv = useTranslations("validation");
  const tt = useTranslations("parents.toasts");
  const create = useCreateParent();
  const update = useUpdateParent();
  const isEdit = !!parent;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParentValues>({
    resolver: zodResolver(parentSchema(tv)),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      parent
        ? {
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            occupation: parent.occupation,
            address: parent.address,
          }
        : EMPTY,
    );
  }, [open, parent, reset]);

  async function onSubmit(values: ParentValues) {
    try {
      if (isEdit && parent) {
        await update.mutateAsync({ id: parent.id, input: values });
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
              {(aria) => <Input autoComplete="off" {...aria} {...register("name")} />}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="email" label={t("email")} error={errors.email?.message}>
                {(aria) => (
                  <Input
                    type="email"
                    autoComplete="off"
                    {...aria}
                    {...register("email")}
                  />
                )}
              </Field>
              <Field id="phone" label={t("phone")} error={errors.phone?.message}>
                {(aria) => (
                  <Input type="tel" autoComplete="off" {...aria} {...register("phone")} />
                )}
              </Field>
            </div>

            <Field
              id="occupation"
              label={t("occupation")}
              error={errors.occupation?.message}
            >
              {(aria) => (
                <Input autoComplete="off" {...aria} {...register("occupation")} />
              )}
            </Field>

            <Field id="address" label={t("address")} error={errors.address?.message}>
              {(aria) => <Textarea rows={3} {...aria} {...register("address")} />}
            </Field>
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
