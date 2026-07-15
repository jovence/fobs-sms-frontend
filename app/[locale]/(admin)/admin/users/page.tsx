import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminUsersTable } from "@/features/admin/users/components/admin-users-table";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("adminUsers");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AdminUsersTable />
    </div>
  );
}
