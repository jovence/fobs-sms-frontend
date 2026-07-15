"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircle, ArrowUpCircle, MoreHorizontal, Sparkles, ToggleLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminSchool, SubscriptionTier } from "../types";

const TIER_STYLE: Record<SubscriptionTier, string> = {
  free: "bg-muted text-muted-foreground ring-border",
  basic: "bg-info/10 text-info ring-info/20",
  pro: "bg-primary/10 text-primary ring-primary/20",
};

type Labels = {
  school: string;
  owner: string;
  subscription: string;
  students: string;
  actions: string;
  demo: string;
  upgrade: string;
  downgrade: string;
  toggleDemo: string;
  tiers: Record<SubscriptionTier, string>;
};

export function getAdminSchoolColumns({
  labels,
  locale,
  onSetTier,
  onToggleDemo,
}: {
  labels: Labels;
  locale: string;
  onSetTier: (s: AdminSchool, tier: SubscriptionTier) => void;
  onToggleDemo: (s: AdminSchool) => void;
}): ColumnDef<AdminSchool, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.school} />,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar text-[11px] font-bold text-sidebar-primary">
              {s.acronym.slice(0, 3)}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-medium">
                {s.name}
                {s.isDemo && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{labels.demo}</Badge>}
              </p>
              <p className="truncate text-xs text-muted-foreground tabular-nums">{s.code}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "ownerName",
      header: labels.owner,
      enableSorting: false,
      cell: ({ row }) => <span className="text-sm whitespace-nowrap">{row.original.ownerName}</span>,
    },
    {
      accessorKey: "subscription",
      header: labels.subscription,
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
            TIER_STYLE[row.original.subscription],
          )}
        >
          {row.original.subscription === "pro" && <Sparkles className="size-3" />}
          {labels.tiers[row.original.subscription]}
        </span>
      ),
    },
    {
      accessorKey: "studentCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.students} />,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Users className="size-3.5 text-muted-foreground" /> {formatNumber(row.original.studentCount, locale)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {s.subscription === "free" && (
                  <DropdownMenuItem onClick={() => onSetTier(s, "basic")}>
                    <ArrowUpCircle className="mr-2 size-4 text-info" /> {labels.upgrade}
                  </DropdownMenuItem>
                )}
                {s.subscription === "basic" && (
                  <>
                    <DropdownMenuItem onClick={() => onSetTier(s, "pro")}>
                      <ArrowUpCircle className="mr-2 size-4 text-primary" /> {labels.tiers.pro}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSetTier(s, "free")}>
                      <ArrowDownCircle className="mr-2 size-4 text-muted-foreground" /> {labels.downgrade}
                    </DropdownMenuItem>
                  </>
                )}
                {s.subscription === "pro" && (
                  <DropdownMenuItem onClick={() => onSetTier(s, "basic")}>
                    <ArrowDownCircle className="mr-2 size-4 text-muted-foreground" /> {labels.tiers.basic}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleDemo(s)}>
                  <ToggleLeft className="mr-2 size-4" /> {labels.toggleDemo}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
