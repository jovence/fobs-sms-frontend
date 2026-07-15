"use client";

import { useTranslations } from "next-intl";
import { BookOpen, School } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassesTable } from "./classes-table";
import { SubjectsTable } from "./subjects-table";

export function AcademicsTabs() {
  const t = useTranslations("academics");
  return (
    <Tabs defaultValue="classes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="classes" className="gap-1.5">
          <School className="size-4" /> {t("tabs.classes")}
        </TabsTrigger>
        <TabsTrigger value="subjects" className="gap-1.5">
          <BookOpen className="size-4" /> {t("tabs.subjects")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="classes">
        <ClassesTable />
      </TabsContent>
      <TabsContent value="subjects">
        <SubjectsTable />
      </TabsContent>
    </Tabs>
  );
}
