import type { Permission } from "@/config/roles";
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  UserCircle,
  CreditCard,
  Gift,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** i18n key under the `nav` namespace. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
  /** Permission required to see this item; omit for always-visible. */
  permission?: Permission;
  /** Grouping header (i18n key) for the sidebar section. */
  section: "main" | "administration";
}

export const navigation: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard, section: "main" },
  { labelKey: "schools", href: "/schools", icon: School, permission: "school.view", section: "main" },
  { labelKey: "students", href: "/students", icon: Users, permission: "student.view", section: "main" },
  { labelKey: "teachers", href: "/teachers", icon: GraduationCap, permission: "teacher.view", section: "main" },
  { labelKey: "academics", href: "/academics", icon: BookOpen, permission: "academics.view", section: "main" },
  { labelKey: "attendance", href: "/attendance", icon: CalendarCheck, permission: "attendance.view", section: "main" },
  { labelKey: "exams", href: "/exams", icon: ClipboardList, permission: "exam.view", section: "main" },
  { labelKey: "reports", href: "/reports", icon: FileText, permission: "report.view", section: "main" },
  { labelKey: "parents", href: "/parents", icon: UserCircle, permission: "parent.view", section: "main" },
  { labelKey: "billing", href: "/billing", icon: CreditCard, permission: "billing.view", section: "administration" },
  { labelKey: "referrals", href: "/referrals", icon: Gift, permission: "referral.manage", section: "administration" },
  { labelKey: "settings", href: "/settings", icon: Settings, section: "administration" },
];
