import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "date-fns";
import type { IDateFilter, IJobWithTrack } from "@/api/jobs";

export type TJobDateType = IDateFilter["type"];

export type TJobDateTypeSelection = "all" | TJobDateType;

export const DATE_TYPE_SELECTIONS: readonly TJobDateTypeSelection[] = [
  "all",
  "deadline",
  "interview",
  "applied",
] as const;

export const JOB_DATE_TYPE_LABELS: Record<TJobDateTypeSelection, string> = {
  all: "All",
  deadline: "Deadline",
  interview: "Interview",
  applied: "Applied",
};

export type TJobDatePresetKey =
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-year";

export type TDateFilterChange =
  | { kind: "preset"; type: TJobDateTypeSelection; key: TJobDatePresetKey }
  | { kind: "custom"; type: TJobDateTypeSelection; from?: string; to?: string };

export interface IJobDatePreset {
  key: TJobDatePresetKey;
  label: string;
  getFilter: (now: Date, type: TJobDateTypeSelection) => IDateFilter[];
}

export const buildDateFiltersForType = (
  type: TJobDateTypeSelection,
  from: string | undefined,
  to: string | undefined
): IDateFilter[] =>
  type === "all"
    ? [
        { type: "deadline", from, to },
        { type: "interview", from, to },
        { type: "applied", from, to },
      ]
    : [{ type, from, to }];

export const JOB_DATE_PRESETS: IJobDatePreset[] = [
  {
    key: "this-week",
    label: "This week",
    getFilter: (now, type) => {
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      return buildDateFiltersForType(
        type,
        start.toISOString(),
        end.toISOString()
      );
    },
  },
  {
    key: "this-month",
    label: "This month",
    getFilter: (now, type) => {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return buildDateFiltersForType(
        type,
        start.toISOString(),
        end.toISOString()
      );
    },
  },
  {
    key: "last-month",
    label: "Last month",
    getFilter: (now, type) => {
      const prevMonth = subMonths(now, 1);
      const start = startOfMonth(prevMonth);
      const end = endOfMonth(prevMonth);
      return buildDateFiltersForType(
        type,
        start.toISOString(),
        end.toISOString()
      );
    },
  },
  {
    key: "this-year",
    label: "This year",
    getFilter: (now, type) => {
      const start = startOfYear(now);
      const end = endOfYear(now);
      return buildDateFiltersForType(
        type,
        start.toISOString(),
        end.toISOString()
      );
    },
  },
];

export const getDatePreset = (
  key: string | null | undefined
): IJobDatePreset | undefined => JOB_DATE_PRESETS.find((p) => p.key === key);

const jobDateValue = (
  job: IJobWithTrack,
  type: IDateFilter["type"]
): string | null | undefined => {
  if (type === "deadline") {
    return job.deadline;
  }
  if (type === "interview") {
    return job.track.interviewDate;
  }
  return job.track.appliedAt;
};

const inDateRange = (value: string, filter: IDateFilter): boolean => {
  const time = new Date(value).getTime();
  if (filter.from && time < new Date(filter.from).getTime()) {
    return false;
  }
  return !(filter.to && time > new Date(filter.to).getTime());
};

export const matchesJobDateFilters = (
  job: IJobWithTrack,
  filters: IDateFilter[]
): boolean =>
  filters.length === 0 ||
  filters.some((filter) => {
    const value = jobDateValue(job, filter.type);
    return typeof value === "string" ? inDateRange(value, filter) : false;
  });

export const resolveDateFilters = (fields: {
  dateType: TJobDateTypeSelection;
  datePreset: TJobDatePresetKey | undefined;
  dateFrom: string | undefined;
  dateTo: string | undefined;
}): IDateFilter[] => {
  const preset = fields.datePreset
    ? getDatePreset(fields.datePreset)
    : undefined;
  if (preset) {
    return preset.getFilter(new Date(), fields.dateType);
  }
  if (fields.dateFrom || fields.dateTo) {
    return buildDateFiltersForType(
      fields.dateType,
      fields.dateFrom,
      fields.dateTo
    );
  }
  return [];
};
