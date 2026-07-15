import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminReferralsTable } from "@/features/admin/referrals/components/admin-referrals-table";

export default async function AdminReferralsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("adminReferrals");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AdminReferralsTable />
    </div>
  );
}
