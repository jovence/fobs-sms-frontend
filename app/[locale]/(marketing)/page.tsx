import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, CalendarCheck, FileText, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing" });
  return {
    title: t("heroTitle"),
    description: t("heroSubtitle"),
    alternates: { canonical: locale === "en" ? "/" : `/${locale}` },
    openGraph: { title: t("heroTitle"), description: t("heroSubtitle") },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing");

  const features = [
    { icon: Users, title: t("feature1Title"), body: t("feature1Body") },
    { icon: FileText, title: t("feature2Title"), body: t("feature2Body") },
    { icon: CalendarCheck, title: t("feature3Title"), body: t("feature3Body") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(60% 60% at 50% -10%, color-mix(in oklch, var(--primary) 14%, transparent) 0, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BookOpen className="size-3.5 text-primary" />
            {t("featuresTitle")}
          </span>
          <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                {t("getStarted")} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t("signIn")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/70">
              <CardContent className="space-y-3 p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5.5" />
                </span>
                <h2 className="font-heading text-lg font-semibold">{f.title}</h2>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
