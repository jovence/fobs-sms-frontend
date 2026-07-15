"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type NotificationKey = "emailUpdates" | "marksPublished" | "attendanceAlerts";

const ITEMS: NotificationKey[] = [
  "emailUpdates",
  "marksPublished",
  "attendanceAlerts",
];

const DEFAULTS: Record<NotificationKey, boolean> = {
  emailUpdates: true,
  marksPublished: true,
  attendanceAlerts: false,
};

export function NotificationsPanel() {
  const t = useTranslations("settings.notifications");
  const [prefs, setPrefs] = useState<Record<NotificationKey, boolean>>(DEFAULTS);

  function toggle(key: NotificationKey, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    const name = t(`${key}Title`);
    toast.success(value ? t("enabledToast", { name }) : t("disabledToast", { name }));
  }

  return (
    <Card className="card-interactive shadow-[var(--shadow-sm)]">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-1">
        {ITEMS.map((key, i) => (
          <div
            key={key}
            className={`flex items-center justify-between gap-4 py-4 ${
              i > 0 ? "border-t" : ""
            }`}
          >
            <div className="space-y-0.5 pr-2">
              <Label htmlFor={`notify-${key}`} className="cursor-pointer">
                {t(`${key}Title`)}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(`${key}Description`)}
              </p>
            </div>
            <Switch
              id={`notify-${key}`}
              checked={prefs[key]}
              onCheckedChange={(v) => toggle(key, v === true)}
              aria-label={t(`${key}Title`)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
