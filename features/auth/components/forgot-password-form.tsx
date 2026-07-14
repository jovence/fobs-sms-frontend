"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "../hooks";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const forgot = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema(tv)),
    defaultValues: { email: "" },
  });

  const busy = isSubmitting || forgot.isPending;

  if (forgot.isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-success/5 px-6 py-10 text-center">
          <CheckCircle2 className="size-10 text-success" />
          <p className="text-sm text-muted-foreground">{t("resetSent")}</p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">{t("backToSignIn")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => forgot.mutate(v))}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {t("sendResetLink")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("backToSignIn")}
        </Link>
      </p>
    </form>
  );
}
