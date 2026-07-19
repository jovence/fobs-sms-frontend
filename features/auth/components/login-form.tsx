"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { ApiError } from "@/types";
import { authErrorMessageKey } from "../error-message";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "../hooks";
import { loginSchema, type LoginValues } from "../schemas";

export function LoginForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema(tv)),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const session = await login.mutateAsync(values);
      toast.success(t("welcome", { name: session.user.name.split(" ")[0] }));
      router.replace("/dashboard");
    } catch (err) {
      // Distinguish "wrong credentials" from connectivity/server failures so a
      // user on a flaky connection isn't told their (correct) password is wrong.
      const invalidCredentials =
        err instanceof ApiError &&
        (err.code === "invalid_credentials" ||
          err.code === "unauthorized" ||
          err.status === 401);
      setFormError(
        invalidCredentials ? t("invalidCredentials") : t(authErrorMessageKey(err)),
      );
    }
  }

  const busy = isSubmitting || login.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <Alert variant="destructive" aria-live="assertive">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-destructive text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("password")}</Label>
          <Link
            href="/forgot-password"
            className="text-primary text-sm font-medium hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 grid w-10 place-items-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-destructive text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      <Controller
        control={control}
        name="remember"
        render={({ field }) => (
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            <Checkbox
              checked={field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
            {t("rememberMe")}
          </label>
        )}
      />

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? t("signingIn") : t("signIn")}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          {t("signUp")}
        </Link>
      </p>

      <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-center text-xs">
        Demo · <span className="font-mono">owner@fobs.cm</span> /{" "}
        <span className="font-mono">password</span>
      </p>
    </form>
  );
}
