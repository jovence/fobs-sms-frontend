"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardCheck, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceRecord } from "./attendance-record";
import { AttendanceHistory } from "./attendance-history";

export function AttendanceTabs() {
  const t = useTranslations("attendance");
  const [tab, setTab] = useState("record");

  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-4">
      <TabsList>
        <TabsTrigger value="record">
          <ClipboardCheck className="size-4" />
          {t("tabs.record")}
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="size-4" />
          {t("tabs.history")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="record" className="mt-0 focus-visible:outline-none">
        <AttendanceRecord />
      </TabsContent>
      <TabsContent value="history" className="mt-0 focus-visible:outline-none">
        <AttendanceHistory />
      </TabsContent>
    </Tabs>
  );
}
