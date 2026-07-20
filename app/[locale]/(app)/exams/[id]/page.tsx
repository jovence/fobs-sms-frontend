import { setRequestLocale } from "next-intl/server";
import { ExamDetail } from "@/features/exams/components/detail/exam-detail";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <ExamDetail id={id} />;
}
