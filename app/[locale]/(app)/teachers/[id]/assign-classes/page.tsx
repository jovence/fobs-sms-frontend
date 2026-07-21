import { setRequestLocale } from "next-intl/server";
import { AssignClassesForm } from "@/features/teachers/components/assign-classes-form";

export default async function AssignClassesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <AssignClassesForm teacherId={id} />;
}
