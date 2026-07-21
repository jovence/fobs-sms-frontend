"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useClassOptions } from "@/features/academics/hooks";
import { StudentFormSheet } from "./student-form-sheet";

export function StudentCreateView() {
  const t = useTranslations("students");
  const tf = useTranslations("students.form");
  const router = useRouter();
  const { data: classOptions = [] } = useClassOptions();
  const [open, setOpen] = useState(true);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) router.push("/students");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("title")}
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {tf("createTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{tf("createSubtitle")}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/students">
            <ArrowLeft /> {t("detail.back")}
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/30 p-8 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Plus className="size-5" />
        </div>
        <h2 className="font-heading text-lg font-semibold">{tf("createTitle")}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {tf("createSubtitle")}
        </p>
        <Button className="mt-5" onClick={() => setOpen(true)}>
          <Plus /> {t("add")}
        </Button>
      </div>

      <StudentFormSheet
        open={open}
        onOpenChange={handleOpenChange}
        student={null}
        classes={classOptions}
      />
    </div>
  );
}
