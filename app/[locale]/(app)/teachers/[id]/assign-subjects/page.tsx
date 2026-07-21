import { setRequestLocale } from "next-intl/server";
import { AssignSubjectsForm } from "@/features/teachers/components/assign-subjects-form";

export default async function AssignSubjectsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <AssignSubjectsForm teacherId={id} />;
}
