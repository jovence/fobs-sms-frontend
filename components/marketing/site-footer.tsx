import { useTranslations } from "next-intl";
import { Logo } from "@/components/common/logo";

export function SiteFooter() {
  const t = useTranslations("common");
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo />
        <p className="text-sm text-muted-foreground">
          © {new Date(0).getFullYear() || 2026} FOBS SMS · {t("tagline")}
        </p>
      </div>
    </footer>
  );
}
