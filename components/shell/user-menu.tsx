"use client";

import { useTranslations } from "next-intl";
import { LogOut, Settings, ShieldCheck, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { useRouter, Link } from "@/i18n/navigation";
import { initials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const t = useTranslations("common");
  const user = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  if (!user) return null;

  async function signOut() {
    await logout.mutateAsync();
    toast.success(t("signOut"));
    router.replace("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={user.name}
      >
        <Avatar className="size-9 border">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm font-semibold">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="font-medium text-primary">
              <ShieldCheck className="mr-2 size-4" /> {t("adminPanel")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <UserCircle className="mr-2 size-4" /> {t("edit")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 size-4" /> {t("theme")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          disabled={logout.isPending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" /> {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
