import { setRequestLocale } from "next-intl/server";
import { StudentCreateView } from "@/features/students/components/student-create-view";

export default async function StudentCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StudentCreateView />;
}
