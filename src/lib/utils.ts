import { differenceInCalendarDays } from "date-fns";
import { URGENT_DAYS_THRESHOLD } from "@/app.constants.ts";
import type { TResolvedTheme } from "@/components/theme/themes.types.ts";

export const isUrgent = (date?: string | null): boolean => {
  const days = daysUntil(date);
  return days !== null && days <= URGENT_DAYS_THRESHOLD;
};

export const daysUntil = (date?: string | null): number | null => {
  if (!date) {
    return null;
  }
  return differenceInCalendarDays(new Date(date), new Date());
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,func-style,sonarjs/declarations-in-global-scope
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object") {
    const errorCast = error as {
      error?: { message?: string };
      message?: string;
    };
    return (
      errorCast.error?.message ?? errorCast.message ?? "Something went wrong"
    );
  }
  return "Something went wrong";
};

export const getSystemTheme = (): TResolvedTheme => {
  if (globalThis.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const stringToDate = (
  dateStr: string | null | undefined
): Date | undefined => {
  if (!dateStr) {
    return;
  }
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const stripNulls = (value: unknown): unknown => {
  if (value === null) {
    return;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(stripNulls);
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripNulls(v)])
    );
  }
  if (typeof value === "string") {
    if (value.length === 0) {
      return;
    }
    return value.trim();
  }
  return value;
};

const CAMEL_CASE_SEPARATOR = /([a-z])([A-Z])/g;
const FIRST_CHAR = /^./;

export const formatSectionLabel = (key: string): string =>
  key
    .replace(CAMEL_CASE_SEPARATOR, "$1 $2")
    .replace(FIRST_CHAR, (char) => char.toUpperCase());
