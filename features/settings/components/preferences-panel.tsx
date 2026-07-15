"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Check, Languages, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ThemeKey = "light" | "dark" | "system";

const OPTIONS: { key: ThemeKey; icon: LucideIcon }[] = [
  { key: "light", icon: Sun },
  { key: "dark", icon: Moon },
  { key: "system", icon: Monitor },
];

export function PreferencesPanel() {
  const t = useTranslations("settings.preferences");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes resolves the active theme only on the client.
  useEffect(() => setMounted(true), []);
  const active = (mounted ? theme : undefined) as ThemeKey | undefined;

  return (
    <Card className="card-interactive shadow-[var(--shadow-sm)]">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">{t("theme")}</legend>
          <div
            role="radiogroup"
            aria-label={t("theme")}
            className="grid gap-3 sm:grid-cols-3"
          >
            {OPTIONS.map(({ key, icon: Icon }) => {
              const selected = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(key)}
                  className={cn(
                    "group relative flex flex-col items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    selected
                      ? "border-primary shadow-[var(--shadow-sm)] ring-1 ring-primary"
                      : "hover:border-primary/40 hover:bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-lg transition-colors",
                      selected
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="space-y-0.5">
                    <span className="block text-sm font-semibold">
                      {t(`${key}Title`)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t(`${key}Description`)}
                    </span>
                  </span>
                  {selected && (
                    <Check className="absolute top-3 right-3 size-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Separator />

        <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Languages className="size-5" />
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t("language")}</p>
            <p className="text-sm text-muted-foreground">{t("languageNote")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
