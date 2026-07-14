import { siteConfig } from "@/config/site";

/** Format money in XAF (Central African CFA franc) — the platform currency. */
export function formatCurrency(amount: number, locale = "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CM" : "en-CM", {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, locale = "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CM" : "en-CM").format(value);
}

export function formatPercent(value: number, locale = "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CM" : "en-CM", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatDate(input: string | Date, locale = "en"): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CM" : "en-CM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Cameroon academic year rolls over in July (mirrors the backend rule). */
export function currentAcademicYear(now = new Date()): string {
  const y = now.getFullYear();
  return now.getMonth() + 1 >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

/** Normalise a Cameroonian phone number to +237 form for display. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const national = digits.startsWith("237") ? digits.slice(3) : digits;
  return `+237 ${national.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`.trim();
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
