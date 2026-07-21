"use client";

import { useTranslations } from "next-intl";
import { FileText, PenLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkEntry } from "./mark-entry";
import { ReportCardsPanel } from "./report-cards-panel";

export function ReportsTabs() {
  const t = useTranslations("reports");
  return (
    <Tabs defaultValue="entry" className="space-y-4">
      <TabsList>
        <TabsTrigger value="entry" className="gap-1.5">
          <PenLine className="size-4" /> {t("tabs.markEntry")}
        </TabsTrigger>
        <TabsTrigger value="cards" className="gap-1.5">
          <FileText className="size-4" /> {t("tabs.reportCards")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="entry">
        <MarkEntry />
      </TabsContent>
      <TabsContent value="cards">
        <ReportCardsPanel />
      </TabsContent>
    </Tabs>
  );
}
