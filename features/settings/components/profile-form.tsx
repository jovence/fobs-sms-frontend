"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/features/auth/hooks";
import { withLatency } from "@/lib/mock";
import { initials } from "@/lib/format";
import { profileSchema, type ProfileValues } from "../schemas";

export function ProfileForm() {
  const t = useTranslations("settings.profile");
  const tv = useTranslations("validation");
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema(tv)),
    defaultValues: { name: "", email: "" },
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    reset({ name: user?.name ?? "", email: user?.email ?? "" });
    setReady(true);
  }, [user, reset]);

  const nameValue = watch("name");

  async function onSubmit(values: ProfileValues) {
    try {
      await withLatency(values, 700);
      toast.success(t("saved"));
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <Card className="card-interactive shadow-[var(--shadow-sm)]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-base font-semibold">
                {initials(nameValue || user?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {nameValue || user?.name || t("name")}
              </p>
              {user?.role && (
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t("name")}</Label>
              <Input
                id="profile-name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                disabled={!ready}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">{t("email")}</Label>
              <Input
                id="profile-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                disabled={!ready}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={isSubmitting || !ready}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
