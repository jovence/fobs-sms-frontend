import { getTranslations, setRequestLocale } from "next-intl/server";
import { AcademicsTabs } from "@/features/academics/components/academics-tabs";

export default async function AcademicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("academics");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AcademicsTabs />
    </div>
  );
}
