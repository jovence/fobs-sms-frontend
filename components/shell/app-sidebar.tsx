import { Logo } from "@/components/common/logo";
import { SchoolSwitcher } from "./school-switcher";
import { SidebarNav } from "./sidebar-nav";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Fixed navy rail — the institutional signature of the dashboard. Desktop only. */
export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-5 border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
      <div className="px-1">
        <Logo tone="invert" />
      </div>
      <SchoolSwitcher />
      <ScrollArea className="-mx-1 flex-1 px-1">
        <SidebarNav />
      </ScrollArea>
    </aside>
  );
}
