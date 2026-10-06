import { format } from "date-fns";
import type { TResumeContent } from "@/components/resume/job-profile/resume.helpers.ts";
import { objectToString } from "@/lib/ai/objectToString.ts";

export const formatToString = (
  value: unknown,
  numberSuffix = ""
): string | null => {
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }
    if (value.every((entry) => typeof entry === "number")) {
      return `${value.length} ${numberSuffix}`;
    }
    return value.filter((entry) => entry !== "").join(", ");
  }
  return String(value);
};

function toSafeDate(value?: Date | string | null): Date | undefined {
  if (!value) {
    return;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatMonthYear(value?: Date | null): string {
  const date = toSafeDate(value);
  return date ? format(date, "MMMM, yyyy") : "";
}

export function formatYear(value?: Date | null): string {
  const date = toSafeDate(value);
  return date ? `${date.getFullYear()}` : "";
}

export function dateRange(
  start?: Date | null,
  end?: Date | null,
  isCurrent?: boolean,
  yearOnly = false
): string {
  const fmt = yearOnly ? formatYear : formatMonthYear;
  const s = fmt(start);
  const e = isCurrent ? "Present" : fmt(end);
  if (s && e) {
    return `${s} - ${e}`;
  }
  return s || e;
}

const PROTOCOL_REGEX = /^https?:\/\//;
export function stripProtocol(url: string) {
  return url.replace(PROTOCOL_REGEX, "");
}

export const resumeToText = (content?: TResumeContent | null): string => {
  if (!content) {
    return "";
  }
  return objectToString(content, {
    omit: ["id"],
    omitPaths: ["references"],
    bulletKeys: ["responsibilities", "coursework"],
  });
};
