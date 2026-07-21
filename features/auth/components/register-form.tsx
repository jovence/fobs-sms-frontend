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
import { Field } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegister } from "../hooks";
import { registerSchema, type RegisterValues } from "../schemas";

const backendFieldMap: Record<string, keyof RegisterValues> = {
  name: "name",
  email: "email",
  phone: "phone",
  password: "password",
  password_confirmation: "confirmPassword",
};

function registerErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  if (err.code === "network") return "Network error: the frontend could not reach the backend.";
  if (err.code === "validation" || err.status === 422) {
    return "Backend validation failed. Check the highlighted fields below.";
  }
  if (err.status >= 500) return `Backend error (${err.status}): ${err.message}`;
  return err.message || fallback;
}

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
      if (err instanceof ApiError && err.fields) {
        for (const [backendField, message] of Object.entries(err.fields)) {
          const formField = backendFieldMap[backendField];
          if (formField) setError(formField, { message });
        }
      }
      setFormError(registerErrorMessage(err, t(authErrorMessageKey(err))));
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
        {(aria) => <Input autoComplete="name" {...aria} {...register("name")} />}
      </Field>

      <Field id="email" label={t("email")} error={errors.email?.message}>
        {(aria) => (
          <Input
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            {...aria}
            {...register("email")}
          />
        )}
      </Field>

      <Field
        id="phone"
        label={t("phone")}
        error={errors.phone?.message}
        optionalLabel={t("optional")}
      >
        {(aria) => (
          <Input
            type="tel"
            autoComplete="tel"
            placeholder="+237 6XX XXX XXX"
            {...aria}
            {...register("phone")}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="password" label={t("password")} error={errors.password?.message}>
          {(aria) => (
            <Input
              type="password"
              autoComplete="new-password"
              {...aria}
              {...register("password")}
            />
          )}
        </Field>
        <Field
          id="confirmPassword"
          label={t("confirmPassword")}
          error={errors.confirmPassword?.message}
        >
          {(aria) => (
            <Input
              type="password"
              autoComplete="new-password"
              {...aria}
              {...register("confirmPassword")}
            />
          )}
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
