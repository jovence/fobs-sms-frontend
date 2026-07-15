import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminSchoolsTable } from "@/features/admin/schools/components/admin-schools-table";

export default async function AdminSchoolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("adminSchools");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AdminSchoolsTable />
    </div>
  );
}
