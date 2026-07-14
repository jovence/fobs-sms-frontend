"use client";

import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus, School as SchoolIcon } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { useActiveSchool, useSession } from "@/features/auth/hooks";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SchoolSwitcher() {
  const t = useTranslations("tenancy");
  const session = useSession();
  const active = useActiveSchool();
  const setActiveSchool = useAuthStore((s) => s.setActiveSchool);

  const memberships = session?.memberships ?? [];

  if (memberships.length === 0) {
    return (
      <Link
        href="/schools"
        className="flex items-center gap-2 rounded-lg border border-dashed border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
      >
        <Plus className="size-4" />
        {t("createSchool")}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
        aria-label={t("switchSchool")}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary/15 text-xs font-bold text-sidebar-primary">
          {active ? initials(active.school.name) : <SchoolIcon className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-sidebar-foreground">
            {active?.school.acronym ?? t("activeSchool")}
          </span>
          <span className="block truncate text-xs text-sidebar-foreground/60">
            {active?.school.name}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72￼">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t("switchSchool")}
        </DropdownMenuLabel>
        {memberships.map((m) => (
          <DropdownMenuItem
            key={m.school.id}
            onClick={() => setActiveSchool(m.school.id)}
            className="gap-2.5"
          >
            <span className="grid size-7 place-items-center rounded-md bg-muted text-[11px] font-bold">
              {initials(m.school.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{m.school.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {m.school.code}
              </span>
            </span>
            {m.school.isDemo && (
              <Badge variant="secondary" className="text-[10px]">
                {t("demo")}
              </Badge>
            )}
            {active?.school.id === m.school.id && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/schools" className="gap-2">
            <Plus className="size-4" /> {t("createSchool")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
