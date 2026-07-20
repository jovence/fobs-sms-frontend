"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordSchema, type PasswordValues } from "../schemas";

const EMPTY: PasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function SecurityForm() {
  const t = useTranslations("settings.security");
  const tv = useTranslations("validation");

  const {
    register,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema(tv)),
    defaultValues: EMPTY,
  });

  return (
    <Card className="card-interactive shadow-[var(--shadow-sm)]">
      {/* No password-change endpoint exists yet, so Save is disabled rather than
          faking a successful update. */}
      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p role="alert" className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t("newPassword")}</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
              {errors.newPassword ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.newPassword.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{t("hint")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4 shrink-0 text-primary" aria-hidden />
            {t("unavailable")}
          </p>
          <Button type="button" disabled>
            {t("save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
