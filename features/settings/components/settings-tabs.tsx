"use client";

import { useTranslations } from "next-intl";
import { Bell, Palette, ShieldCheck, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/common/motion";
import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";
import { PreferencesPanel } from "./preferences-panel";
import { NotificationsPanel } from "./notifications-panel";

export function SettingsTabs() {
  const t = useTranslations("settings.tabs");

  return (
    <Reveal>
      <Tabs defaultValue="profile" className="gap-6">
        <TabsList className="w-full max-w-xl">
          <TabsTrigger value="profile">
            <UserRound className="size-4" />
            {t("profile")}
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="size-4" />
            {t("security")}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="size-4" />
            {t("preferences")}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4" />
            {t("notifications")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="security">
          <SecurityForm />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesPanel />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsPanel />
        </TabsContent>
      </Tabs>
    </Reveal>
  );
}
