import { differenceInCalendarDays } from "date-fns";
import { URGENT_DAYS_THRESHOLD } from "@/app.constants.ts";
import type { TResolvedTheme } from "@/components/theme/themes.types.ts";

export const isUrgent = (date?: string | null): boolean => {
  const days = daysUntil(date);
  return days !== null && days <= URGENT_DAYS_THRESHOLD;
};

export const isHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const HTTP_REGEX = /^[a-z][a-z0-9+.-]*:\/\//iu;
export const normalizeHttpUrl = (value: string): string | null => {
  const input = value.trim();
  if (!input) {
    return null;
  }

  const hasScheme = HTTP_REGEX.test(input);
  try {
    const url = new URL(hasScheme ? input : `https://${input}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    if (url.username || url.password) {
      return null;
    }
    if (!url.hostname.includes(".")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
};

export const daysUntil = (date?: string | null): number | null => {
  if (!date) {
    return null;
  }
  return differenceInCalendarDays(new Date(date), new Date());
};

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

const LOOKUP_NAME_SEPARATOR = /[._\-(),]/gu;
const LOOKUP_NAME_WHITESPACE = /\s+/gu;

export const normalizeLookupName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(LOOKUP_NAME_SEPARATOR, "")
    .replace(LOOKUP_NAME_WHITESPACE, " ");

export const buildLookupNameMap = (
  entries: readonly { id: number; name: string }[]
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const key = normalizeLookupName(entry.name);
    if (key && !map.has(key)) {
      map.set(key, entry.id);
    }
  }
  return map;
};

const CAMEL_CASE_SEPARATOR = /([a-z])([A-Z])/gu;
const FIRST_CHAR = /^./u;

export const formatSectionLabel = (key: string): string =>
  key
    .replace(CAMEL_CASE_SEPARATOR, "$1 $2")
    .replace(FIRST_CHAR, (char) => char.toUpperCase());

export const capitalizeFirst = (value: string): string =>
  value.replace(FIRST_CHAR, (char) => char.toUpperCase());

export const generateSafeId = (prefix = ""): string => {
  let rand = "";
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      rand = crypto.randomUUID().slice(0, 8);
    } else {
      rand = Math.random().toString(36).slice(2, 10);
    }
  } catch {
    rand = Math.random().toString(36).slice(2, 10);
  }
  return prefix ? `${prefix}-${rand}` : rand;
};

export function markdownToPlain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/gu, "") // fenced code blocks
    .replace(/`([^`]*)`/gu, "$1") // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, "$1") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, "$1") // links
    .replace(/^#{1,6}\s+/gmu, "") // headings
    .replace(/^>\s?/gmu, "") // blockquotes
    .replace(/^[-*+]\s+/gmu, "") // bullets
    .replace(/^\d+\.\s+/gmu, "") // numbered lists
    .replace(/(\*\*|__)(.*?)\1/gu, "$2") // bold
    .replace(/([*_])(.*?)\1/gu, "$2") // italic
    .replace(/~~(.*?)~~/gu, "$1") // strikethrough
    .replace(/^[-*_]{3,}\s*$/gmu, "") // horizontal rules
    .replace(/\n{3,}/gu, "\n\n") // extra blank lines
    .trim();
}
