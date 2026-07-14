import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app surfaces must never be indexed.
      disallow: ["/dashboard", "/students", "/teachers", "/schools", "/academics", "/attendance", "/exams", "/reports", "/parents", "/billing", "/referrals", "/settings", "/login", "/register", "/forgot-password"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
