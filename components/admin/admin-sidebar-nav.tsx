"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { adminNavigation } from "@/config/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav className="flex flex-col gap-1" aria-label={t("overview")}>
      {adminNavigation.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
              active
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={reduce ? undefined : "admin-active"}
                className="absolute inset-0 -z-10 rounded-lg bg-sidebar-primary/15"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className="size-4.5 shrink-0" strokeWidth={active ? 2.4 : 2} />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
