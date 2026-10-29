import type { TJobStatus } from "@/api/jobs";
import { type IJob, JOB_STATUS } from "@/api/jobs";
import {
  DATE_TYPE_SELECTIONS,
  getDatePreset,
  type TJobDatePresetKey,
  type TJobDateTypeSelection,
} from "@/components/jobs/filters/jobDatePresets.ts";
import { formatDate } from "@/lib/date.ts";
import { daysUntil, isHttpUrl } from "@/lib/utils.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

export const STATUS_LABEL: Record<TJobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  scheduled: "Scheduled",
  interviewed: "Interviewed",
  offer: "Offer received",
  rejected: "Rejected",
  // biome-ignore lint/style/useNamingConvention: value comes from the API
  not_selected: "Not selected",
  withdrawn: "Withdrawn",
};

export const STATUS_OPTIONS: { value: TJobStatus; label: string }[] =
  Object.entries(STATUS_LABEL).map(([value, label]) => ({
    value: value as TJobStatus,
    label,
  }));

export const JOB_STATUS_VARIANT = {
  saved: "default",
  applied: "warning",
  scheduled: "success",
  interviewed: "default",
  offer: "success",
  rejected: "danger",
  // biome-ignore lint/style/useNamingConvention: value comes from the API
  not_selected: "danger",
  withdrawn: "default",
} as const;

export interface IJobLink {
  url: string;
  label: string | null;
}

/** `links` is stored as stringified `[{url, label}]`. */
export const parseJobLinks = (links?: string | null): IJobLink[] => {
  if (!links) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(links);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((item: unknown) => {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof (item as { url?: unknown }).url !== "string"
      ) {
        return [];
      }
      const { url, label } = item as { url: string; label?: unknown };
      return isHttpUrl(url)
        ? [{ url, label: typeof label === "string" ? label : null }]
        : [];
    });
  } catch {
    // unparsable text column: treat as no links instead of crashing the page
    return [];
  }
};

export const getDateInfo = (job: IJob): string => {
  const interviewDate = job.track?.interviewDate;
  const appliedAt = job.track?.appliedAt;
  if (interviewDate) {
    const interviewDays = daysUntil(interviewDate);
    return interviewDays !== null && interviewDays >= 0
      ? `${interviewDays} days until interview`
      : `Interviewed at ${formatDate(interviewDate)}`;
  }
  if (appliedAt) {
    return `Applied ${formatDate(appliedAt)}`;
  }
  const days = daysUntil(job.deadline);
  if (days !== null) {
    return days >= 0 ? `${days}d left` : "Deadline passed";
  }

  return `Created: ${formatDate(job.createdAt)}`;
};

const isJobStatus = (value: string | null): value is TJobStatus =>
  typeof value === "string" && JOB_STATUS.some((status) => status === value);

const isDateTypeSelection = (
  value: string | null
): value is TJobDateTypeSelection =>
  typeof value === "string" &&
  DATE_TYPE_SELECTIONS.some((type) => type === value);

const isPresetKey = (value: string | null): value is TJobDatePresetKey =>
  getDatePreset(value) !== undefined;

export const readFiltersFromParams = (params: URLSearchParams) => {
  const { setStatus, setDateChange } = useJobsStore.getState();

  const statusParam = params.get("status");
  if (isJobStatus(statusParam)) {
    setStatus(statusParam);
  }

  const presetParam = params.get("datePreset");
  const typeParam = params.get("dateType");
  if (isPresetKey(presetParam) && isDateTypeSelection(typeParam)) {
    setDateChange({ kind: "preset", type: typeParam, key: presetParam });
  }
};
