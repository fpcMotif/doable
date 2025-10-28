/**
 * Internationalization Utility Functions
 * Provides type-safe translation helpers and formatting utilities
 */

import { useTranslations as useNextIntlTranslations } from "next-intl";

/**
 * Hook to access translations with type safety
 * Use in client components with 'use client' directive
 */
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(typeof date === "number" ? new Date(date) : date);
}

/**
 * Format time based on locale
 */
export function formatTime(date: Date | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(typeof date === "number" ? new Date(date) : date);
}

/**
 * Format date and time based on locale
 */
export function formatDateTime(date: Date | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof date === "number" ? new Date(date) : date);
}

/**
 * Format number based on locale
 */
export function formatNumber(
  number: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Get locale code from locale string (e.g., 'en' from 'en-US')
 */
export function getLocaleCode(locale: string): string {
  return locale.split("-")[0];
}

/**
 * Check if locale is RTL (right-to-left)
 */
export function isRTL(locale: string): boolean {
  const rtlLocales = ["ar", "he", "fa", "ur"];
  return rtlLocales.includes(getLocaleCode(locale));
}
