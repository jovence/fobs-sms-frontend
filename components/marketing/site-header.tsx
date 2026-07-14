import { useTranslations } from "next-intl";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("marketing");
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="FOBS SMS home">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <div className="mx-1.5 hidden h-6 w-px bg-border sm:block" aria-hidden />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
          <Button asChild>
            <Link href="/register">{t("getStarted")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
