import { setRequestLocale } from "next-intl/server";
import { StudentDetail } from "@/features/students/components/detail/student-detail";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <StudentDetail id={id} />;
}
