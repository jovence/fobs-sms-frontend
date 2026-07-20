import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResultSummaryForm } from "@/features/result-summary/components/result-summary-form";

export default async function ResultSummaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("resultSummary");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <ResultSummaryForm />
    </div>
  );
}
