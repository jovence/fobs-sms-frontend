"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GraduationCap, Loader2, Users, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSaveAppSettings, useToggleApp } from "../hooks";
import { appUpdateSchema, type AppUpdateValues } from "../schemas";
import type { AppUpdateSettings } from "../types";

const ICON: Record<string, LucideIcon> = { teacher: GraduationCap, parent: Users };

export function AppControlCard({ settings }: { settings: AppUpdateSettings }) {
  const t = useTranslations("adminAppControl");
  const tv = useTranslations("validation");
  const save = useSaveAppSettings();
  const toggle = useToggleApp();
  const Icon = ICON[settings.appType];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AppUpdateValues>({
    resolver: zodResolver(appUpdateSchema(tv)),
    defaultValues: {
      version: settings.version,
      message: settings.message,
      downloadUrl: settings.downloadUrl,
    },
  });

  useEffect(() => {
    reset({ version: settings.version, message: settings.message, downloadUrl: settings.downloadUrl });
  }, [settings, reset]);

  async function onSubmit(values: AppUpdateValues) {
    await save.mutateAsync({
      appType: settings.appType,
      input: { version: values.version, message: values.message ?? "", downloadUrl: values.downloadUrl ?? "" },
    });
    toast.success(t("toasts.saved"));
  }

  async function onToggle() {
    await toggle.mutateAsync(settings.appType);
    toast.success(t("toasts.saved"));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 border-b">
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-heading font-semibold">{t(`apps.${settings.appType}`)}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {t("currentVersion", { version: settings.version })}
          </p>
        </div>
        {settings.updateAvailable && (
          <Badge className="bg-warning/15 text-warning">{t("updateOn")}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="pr-4">
            <Label htmlFor={`toggle-${settings.appType}`} className="font-medium">
              {t("forceUpdate")}
            </Label>
            <p className="text-xs text-muted-foreground">{t("forceUpdateHint")}</p>
          </div>
          <Switch
            id={`toggle-${settings.appType}`}
            checked={settings.updateAvailable}
            onCheckedChange={onToggle}
            disabled={toggle.isPending}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor={`version-${settings.appType}`}>{t("version")}</Label>
            <Input id={`version-${settings.appType}`} className="tabular-nums" aria-invalid={!!errors.version} {...register("version")} />
            {errors.version && <p role="alert" className="text-sm text-destructive">{errors.version.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`message-${settings.appType}`}>{t("message")}</Label>
            <Textarea id={`message-${settings.appType}`} rows={2} {...register("message")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`url-${settings.appType}`}>{t("downloadUrl")}</Label>
            <Input id={`url-${settings.appType}`} type="url" aria-invalid={!!errors.downloadUrl} {...register("downloadUrl")} />
            {errors.downloadUrl && <p role="alert" className="text-sm text-destructive">{errors.downloadUrl.message}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={save.isPending || !isDirty}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
