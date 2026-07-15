import {
  LayoutDashboard,
  School,
  Users,
  Gift,
  Smartphone,
  Activity,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  /** i18n key under the `admin.nav` namespace. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavigation: AdminNavItem[] = [
  { labelKey: "overview", href: "/admin", icon: LayoutDashboard },
  { labelKey: "schools", href: "/admin/schools", icon: School },
  { labelKey: "users", href: "/admin/users", icon: Users },
  { labelKey: "referrals", href: "/admin/referrals", icon: Gift },
  { labelKey: "appControl", href: "/admin/app-control", icon: Smartphone },
  { labelKey: "activity", href: "/admin/activity", icon: Activity },
];
