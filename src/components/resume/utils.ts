import { format } from "date-fns";
import type { ILookupEntry } from "@/api/lookups";
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

const filterNames = (
  ids: number[] | undefined,
  names?: ReadonlyMap<number, ILookupEntry>
) => (ids ?? []).map((id) => names?.get(id)?.name).filter(Boolean) as string[];

/**
 * Resolves the id fields the schema carries. `professional.industries` are industry ids.
 * `professional.skills` and `projects[].skills` are topic ids;
 */
const withNames = (
  content: TResumeContent,
  names: {
    topics?: Map<number, ILookupEntry>;
    industries?: Map<number, ILookupEntry>;
  }
) => {
  const professional = content.professional
    ? {
        ...content.professional,
        skills: filterNames(content.professional.skills, names.topics),
        industries: filterNames(
          content.professional.industries,
          names.industries
        ),
      }
    : undefined;
  const projects = content.projects?.map((project) => ({
    ...project,
    skills: filterNames(project.skills, names.topics),
  }));
  return {
    ...content,
    professional,
    projects,
  };
};

export const resumeToText = (
  content?: TResumeContent | null,
  names: {
    topics?: Map<number, ILookupEntry>;
    industries?: Map<number, ILookupEntry>;
  } = {}
): string => {
  if (!content) {
    return "";
  }
  return objectToString(withNames(content, names), {
    omit: ["id"],
    omitPaths: [
      "references",
      "professional.skillNames",
      "professional.industriesNames",
    ],
    bulletKeys: ["responsibilities", "coursework"],
  });
};
