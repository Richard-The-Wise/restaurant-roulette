import { clsx, type ClassValue } from "clsx";
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

function formatHourTo12Hour(hourText: string, minuteText: string, locale: Locale) {
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return `${hourText}:${minuteText}`;
  }

  const period = hour >= 12 ? (locale === "es" ? "p. m." : "PM") : locale === "es" ? "a. m." : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function normalizeExistingMeridiem(line: string, locale: Locale) {
  if (locale === "es") {
    return line
      .replace(/a\.?\s*m\.?\.?/gi, "a. m.")
      .replace(/p\.?\s*m\.?\.?/gi, "p. m.");
  }

  return line
    .replace(/a\.?\s*m\.?\.?/gi, "AM")
    .replace(/p\.?\s*m\.?\.?/gi, "PM");
}

export function normalizeWeekdayDescription(line: string, locale: Locale) {
  const trimmed = line.trim();
  if (!trimmed) {
    return trimmed;
  }

  const alreadyHasMeridiem = /\b(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)\b/i.test(trimmed);

  const withFormattedHours = alreadyHasMeridiem
    ? normalizeExistingMeridiem(trimmed, locale)
    : trimmed.replace(/(\d{1,2}):(\d{2})/g, (_, hour: string, minute: string) => formatHourTo12Hour(hour, minute, locale));

  const cleanedLine = withFormattedHours
    .replace(/\.{2,}/g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleanedLine.charAt(0).toUpperCase() + cleanedLine.slice(1);
}

export function formatOpeningHours(hours: OpeningHoursPayload | null, locale: Locale) {
  if (!hours?.weekdayDescriptions?.length) {
    return [locale === "es" ? "Horario no disponible" : "Opening hours unavailable"];
  }

  return hours.weekdayDescriptions.map((line) => normalizeWeekdayDescription(line, locale));
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

  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function starsFromRating(value: number | null, locale: Locale) {
  if (!value) {
    return locale === "es" ? "Sin calificacion" : "No rating";
  }

  return `${value.toFixed(1)} / 5`;
}
