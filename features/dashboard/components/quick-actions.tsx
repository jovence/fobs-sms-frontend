"use client";

import { useTranslations } from "next-intl";
import { CalendarCheck, FileText, PenSquare, UserPlus, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { can } from "@/lib/rbac";
import type { Permission } from "@/config/roles";
import { useCurrentUser } from "@/features/auth/hooks";

interface Action {
  key: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

const actions: Action[] = [
  { key: "addStudent", href: "/students", icon: UserPlus, permission: "student.manage" },
  { key: "recordAttendance", href: "/attendance", icon: CalendarCheck, permission: "attendance.manage" },
  { key: "enterMarks", href: "/reports", icon: PenSquare, permission: "report.view" },
  { key: "generateReport", href: "/reports", icon: FileText, permission: "report.generate" },
];

export function QuickActions() {
  const t = useTranslations("dashboard");
  const user = useCurrentUser();
  const visible = actions.filter((a) => can(user?.role, a.permission));
  if (!visible.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {visible.map(({ key, href, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          className="card-interactive group flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-[var(--shadow-xs)]"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-4.5" />
          </span>
          <span className="text-sm font-medium">{t(key)}</span>
        </Link>
      ))}
    </div>
  );
}
