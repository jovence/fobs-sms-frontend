import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppControl } from "@/features/admin/app-control/components/app-control";

export default async function AdminAppControlPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("adminAppControl");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AppControl />
    </div>
  );
}
