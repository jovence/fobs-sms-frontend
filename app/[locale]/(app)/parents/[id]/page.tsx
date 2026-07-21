import { setRequestLocale } from "next-intl/server";
import { ParentDetail } from "@/features/parents/components/parent-detail";

export default async function ParentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <ParentDetail id={id} />;
}
