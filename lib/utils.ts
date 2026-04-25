import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import type { Locale } from "@/lib/i18n";
import type { OpeningHoursPayload } from "@/types/domain";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceLevel(value: number | null, locale: Locale) {
  if (!value || value < 1) {
    return locale === "es" ? "Sin especificar" : "Unspecified";
  }

  return "$".repeat(value);
}

export function formatOpeningHours(hours: OpeningHoursPayload | null, locale: Locale) {
  if (!hours?.weekdayDescriptions?.length) {
    return [locale === "es" ? "Horario no disponible" : "Opening hours unavailable"];
  }

  return hours.weekdayDescriptions;
}

export function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatDate(value: string | null, locale: Locale) {
  if (!value) {
    return locale === "es" ? "Aun sin visitar" : "Not yet visited";
  }

  return format(new Date(value), "MMM d, yyyy", { locale: locale === "es" ? es : enUS });
}

export function starsFromRating(value: number | null, locale: Locale) {
  if (!value) {
    return locale === "es" ? "Sin calificacion" : "No rating";
  }

  return `${value.toFixed(1)} / 5`;
}
