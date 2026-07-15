import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LocaleSwitcher } from "@/components/common/locale-switcher";

/** Split-panel auth layout: a branded institutional panel + the form. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const t = useTranslations("marketing");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-sidebar px-12 py-10 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)",
          }}
        />
        <Logo tone="invert" />
        <div className="relative space-y-6">
          <h2 className="font-heading text-3xl leading-tight font-bold text-balance">
            {t("heroTitle")}
          </h2>
          <ul className="space-y-3 text-sm text-sidebar-foreground/80">
            {[t("feature1Title"), t("feature2Title"), t("feature3Title")].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-sidebar-primary" />
                {f}
              </li>
            ))}
          </ul>
          <dl className="flex gap-8 border-t border-sidebar-border pt-6">
            {[
              { v: "1,200+", l: "students / school" },
              { v: "99.9%", l: "uptime" },
              { v: "EN · FR", l: "bilingual" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-heading text-xl font-bold text-sidebar-foreground">
                  {s.v}
                </dt>
                <dd className="text-xs text-sidebar-foreground/55">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="relative text-xs text-sidebar-foreground/60">
          © {new Date(0).getFullYear() || 2026} FOBS SMS · Cameroon
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="absolute top-5 right-5 flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-6 space-y-1.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
