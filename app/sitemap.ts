import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

/** Public, indexable marketing routes only — one entry per locale with hreflang alternates. */
const publicPaths = ["", "/pricing", "/features", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(0);
  return publicPaths.map((path) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] =
        locale === routing.defaultLocale
          ? `${siteConfig.url}${path || "/"}`
          : `${siteConfig.url}/${locale}${path}`;
    }
    return {
      url: `${siteConfig.url}${path || "/"}`,
      lastModified,
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.7,
      alternates: { languages },
    };
  });
}
