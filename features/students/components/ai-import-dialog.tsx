"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, FileUp, Loader2, Sparkles, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/states";
import { formatDate } from "@/lib/format";
import { CLASS_SECTIONS, classLabel, classesBySection } from "@/features/academics/class-options";
import { useImportStudents } from "../hooks";
import type { ClassOption, ParsedImportStudent } from "../types";

type Step = "input" | "preview";

/**
 * Two-step AI import: pick a class-list file + target class → the backend runs Gemini and
 * returns a preview → review the extracted rows → confirm to persist them. Matches the old
 * dashboard's file-based Gemini import (POST /students/import → /students/import/confirm).
 */
export function AiImportDialog({
  open,
  onOpenChange,
  classes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
}) {
  const t = useTranslations("students.import");
  const tf = useTranslations("students.form");
  const locale = useLocale();
  const { parse, confirm } = useImportStudents();
  const fileInput = useRef<HTMLInputElement>(null);
  const groupedClasses = classesBySection(classes);
  const classLabels = {
    lower: tf("levelLower"),
    upper: tf("levelUpper"),
    english: tf("sectionEnglish"),
    french: tf("sectionFrench"),
  };

  const [step, setStep] = useState<Step>("input");
  const [file, setFile] = useState<File | null>(null);
  const [classId, setClassId] = useState<string>("");
  const [rows, setRows] = useState<ParsedImportStudent[]>([]);

  function reset() {
    setStep("input");
    setFile(null);
    setClassId("");
    setRows([]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function onParse() {
    if (!file || !classId) {
      toast.error(t("toasts.needFile"));
      return;
    }
    try {
      const preview = await parse.mutateAsync({ file, classId });
      setRows(preview.students);
      setStep("preview");
      toast.success(t("toasts.parsed", { count: preview.students.length }));
    } catch {
      toast.error(t("toasts.parseError"));
    }
  }

  async function onConfirm() {
    try {
      await confirm.mutateAsync({ students: rows, classId });
      toast.success(t("toasts.saved", { count: rows.length }));
      handleOpenChange(false);
    } catch {
      toast.error(t("toasts.saveError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> {t("title")}
          </DialogTitle>
          <DialogDescription>
            {step === "input" ? t("description") : t("previewDescription", { count: rows.length })}
          </DialogDescription>
        </DialogHeader>

        {step === "input" ? (
          <div className="space-y-5">
            <Field id="import-class" label={t("class")}>
              {(aria) => (
                <Select value={classId} onValueChange={setClassId}>
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
                        <SelectLabel>{tf("sectionUnknown")}</SelectLabel>
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
            </Field>

            <div className="space-y-1.5">
              <p className="text-sm font-medium">{t("file")}</p>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:border-ring hover:bg-muted/40"
              >
                <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                  <FileUp className="size-5" />
                </span>
                <span className="text-sm font-medium">
                  {file ? file.name : t("selectFile")}
                </span>
                <span className="text-xs text-muted-foreground">{t("fileHint")}</span>
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".jpg,.jpeg,.png,.heic,.pdf,.xlsx,.xls"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
            {rows.length === 0 ? (
              <EmptyState
                className="border-0"
                icon={<Upload className="size-6" />}
                title={t("empty")}
              />
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>{t("columns.name")}</TableHead>
                    <TableHead>{t("columns.matricule")}</TableHead>
                    <TableHead>{t("columns.gender")}</TableHead>
                    <TableHead>{t("columns.dob")}</TableHead>
                    <TableHead>{t("columns.place")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={`${r.matricule ?? r.fullName}-${i}`}>
                      <TableCell className="font-medium">{r.fullName}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {r.matricule ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.gender === "Male" ? t("male") : t("female")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                        {r.dateOfBirth ? formatDate(r.dateOfBirth, locale) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.placeOfBirth || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "input" ? (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={onParse} disabled={!file || !classId || parse.isPending}>
                {parse.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles />}
                {parse.isPending ? t("parsing") : t("parse")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep("input")}
                disabled={confirm.isPending}
              >
                <ArrowLeft /> {t("back")}
              </Button>
              <Button onClick={onConfirm} disabled={rows.length === 0 || confirm.isPending}>
                {confirm.isPending && <Loader2 className="size-4 animate-spin" />}
                {confirm.isPending ? t("confirming") : t("confirm")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
