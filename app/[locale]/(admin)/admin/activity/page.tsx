import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminActivityTable } from "@/features/admin/activity/components/admin-activity-table";

export default async function AdminActivityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("adminActivity");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AdminActivityTable />
    </div>
  );
}
