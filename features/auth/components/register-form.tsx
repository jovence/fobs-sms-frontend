"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { ApiError } from "@/types";
import { authErrorMessageKey } from "../error-message";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegister } from "../hooks";
import { registerSchema, type RegisterValues } from "../schemas";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const router = useRouter();
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema(tv)),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      const session = await registerMutation.mutateAsync(values);
      toast.success(t("welcome", { name: session.user.name.split(" ")[0] }));
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.code === "email_taken") {
        setError("email", { message: t("emailTaken") });
        return;
      }
      // Any other failure is not "email already taken" — show an accurate message.
      setFormError(t(authErrorMessageKey(err)));
    }
  }

  const busy = isSubmitting || registerMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && (
        <Alert variant="destructive" aria-live="assertive">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Field id="name" label={t("name")} error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </Field>

      <Field id="email" label={t("email")} error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>

      <Field id="phone" label={t("phone")} error={errors.phone?.message} optional>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+237 6XX XXX XXX"
          {...register("phone")}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="password" label={t("password")} error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <Field
          id="confirmPassword"
          label={t("confirmPassword")}
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? t("creatingAccount") : t("signUp")}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && (
          <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
        )}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
