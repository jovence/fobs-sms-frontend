import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReferralHero } from "@/features/referrals/components/referral-hero";
import { ReferralsTable } from "@/features/referrals/components/referrals-table";

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("referrals");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <ReferralHero />

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {t("usagesTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("usagesSubtitle")}</p>
        </div>
        <ReferralsTable />
      </section>
    </div>
  );
}
