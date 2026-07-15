import { useTranslations } from "next-intl";

/** Visually-hidden-until-focused link that lets keyboard users skip the sidebar nav. */
export function SkipLink() {
  const t = useTranslations("common");
  return (
    <a
      href="#main-content"
      className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      {t("skipToContent")}
    </a>
  );
}
