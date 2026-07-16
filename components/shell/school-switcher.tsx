"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { useActiveSchool } from "@/features/auth/hooks";
import { useSchools } from "@/features/schools/hooks";
import { initials } from "@/lib/format";
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
  const { data: schools, isLoading } = useSchools();
  const active = useActiveSchool();
  const setActiveSchool = useAuthStore((s) => s.setActiveSchool);
  const qc = useQueryClient();

  function switchTo(id: string) {
    setActiveSchool(id);
    // Entity lists are scoped to the active school — drop their cache so they refetch.
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "schools" });
  }

  // No schools yet → offer to create one (matches the Schools page).
  if (!isLoading && (schools?.length ?? 0) === 0) {
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
          {active ? initials(active.name) : "—"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-sidebar-foreground">
            {active?.acronym ?? t("activeSchool")}
          </span>
          <span className="block truncate text-xs text-sidebar-foreground/75">
            {active?.name ?? "…"}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t("switchSchool")}
        </DropdownMenuLabel>
        {(schools ?? []).map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={() => switchTo(s.id)}
            className="gap-2.5"
          >
            <span className="grid size-7 place-items-center rounded-md bg-muted text-[11px] font-bold">
              {initials(s.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{s.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{s.code}</span>
            </span>
            {s.isDemo && (
              <Badge variant="secondary" className="text-[10px]">
                {t("demo")}
              </Badge>
            )}
            {active?.id === s.id && <Check className="size-4 text-primary" />}
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
