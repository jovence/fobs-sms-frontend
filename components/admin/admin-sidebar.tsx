import { useTranslations } from "next-intl";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Link } from "@/i18n/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export function AdminSidebar() {
  const t = useTranslations("admin");
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-5 border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
      <div className="space-y-3 px-1">
        <Logo tone="invert" />
        <div className="inline-flex items-center gap-1.5 rounded-md bg-sidebar-primary/15 px-2 py-1 text-[11px] font-semibold tracking-wide text-sidebar-primary uppercase">
          <ShieldCheck className="size-3.5" />
          {t("badge")}
        </div>
      </div>
      <ScrollArea className="-mx-1 flex-1 px-1">
        <AdminSidebarNav />
      </ScrollArea>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToApp")}
      </Link>
    </aside>
  );
}
