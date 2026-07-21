import { setRequestLocale } from "next-intl/server";
import { TeacherProfile } from "@/features/teachers/components/teacher-profile";

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <TeacherProfile id={id} />;
}
