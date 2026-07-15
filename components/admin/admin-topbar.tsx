"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Menu, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { UserMenu } from "@/components/shell/user-menu";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export function AdminTopbar() {
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 gap-5 bg-sidebar p-4 text-sidebar-foreground">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <Logo tone="invert" />
          <AdminSidebarNav onNavigate={() => setOpen(false)} />
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/80"
          >
            <ArrowLeft className="size-4" /> {t("backToApp")}
          </Link>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-primary lg:hidden" />
        <span className="font-heading text-sm font-semibold">{t("title")}</span>
      </div>

      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-border" aria-hidden />
        <UserMenu />
      </div>
    </header>
  );
}
