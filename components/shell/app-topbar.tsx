"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SchoolSwitcher } from "./school-switcher";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

export function AppTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 gap-5 bg-sidebar p-4 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo tone="invert" />
          <SchoolSwitcher />
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:hidden">
        <Logo showWordmark={false} />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-border" aria-hidden />
        <UserMenu />
      </div>
    </header>
  );
}
