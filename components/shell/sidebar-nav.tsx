"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { navigation } from "@/config/navigation";
import { can } from "@/lib/rbac";
import { useCurrentUser } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";

/** The permission-filtered navigation used by both the desktop rail and the mobile drawer. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const user = useCurrentUser();
  const reduce = useReducedMotion();

  const visible = navigation.filter((i) => !i.permission || can(user?.role, i.permission));
  const groups = {
    main: visible.filter((i) => i.section === "main"),
    administration: visible.filter((i) => i.section === "administration"),
  };

  return (
    <nav className="flex flex-col gap-6" aria-label={t("dashboard")}>
      {(["main", "administration"] as const).map((section) =>
        groups[section].length ? (
          <div key={section} className="space-y-1">
            {section === "administration" && (
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
                {t("administration")}
              </p>
            )}
            {groups[section].map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                      layoutId={reduce ? undefined : "sidebar-active"}
                      className="absolute inset-0 -z-10 rounded-lg bg-sidebar-primary/15"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="size-4.5 shrink-0" strokeWidth={active ? 2.4 : 2} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        ) : null,
      )}
    </nav>
  );
}
