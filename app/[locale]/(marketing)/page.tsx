import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/motion";
import { HeroPreview } from "@/components/marketing/hero-preview";

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
  const stats = [
    { value: "1,200+", label: "students / school" },
    { value: "99.9%", label: "uptime" },
    { value: "EN · FR", label: "bilingual" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="mesh-brand relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-xs)] backdrop-blur">
                <ShieldCheck className="size-3.5 text-success" />
                {t("featuresTitle")}
              </span>
              <h1 className="mt-6 font-heading text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                {t("heroTitle")}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
                {t("heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/register">
                    {t("getStarted")} <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">{t("signIn")}</Link>
                </Button>
              </div>
              <dl className="mt-10 flex gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="font-heading text-2xl font-bold tracking-tight">
                      {s.value}
                    </dt>
                    <dd className="text-xs text-muted-foreground">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <BookOpen className="size-4" /> {t("featuresTitle")}
            </span>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="card-interactive h-full rounded-2xl border bg-card p-6 shadow-[var(--shadow-sm)]">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5.5" />
                </span>
                <h2 className="mt-4 font-heading text-lg font-semibold">{f.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="mesh-brand relative overflow-hidden rounded-3xl border bg-card p-10 text-center shadow-[var(--shadow-lg)] sm:p-14">
            <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold tracking-tight text-balance">
              {t("heroTitle")}
            </h2>
            <div className="mt-7 flex justify-center">
              <Button asChild size="lg">
                <Link href="/register">
                  {t("getStarted")} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
