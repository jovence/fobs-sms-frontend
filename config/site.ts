export const siteConfig = {
  name: "FOBS SMS",
  shortName: "FOBS",
  description:
    "FOBS SMS is a school management platform for Cameroonian schools — enrollment, attendance, marks, report cards and parent communication in one dependable place.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://fobs-sms.cm",
  locales: ["en", "fr"] as const,
  defaultLocale: "en" as const,
  currency: "XAF",
  ogImage: "/opengraph-image",
} as const;

export type SiteConfig = typeof siteConfig;
