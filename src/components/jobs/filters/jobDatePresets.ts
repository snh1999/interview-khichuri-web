import type { IDateFilter, IJob } from "@/api/jobs";

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
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      return buildDateFiltersForType(
        type,
        now.toISOString(),
        end.toISOString()
      );
    },
  },
  {
    key: "this-month",
    label: "This month",
    getFilter: (now, type) => {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
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
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
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

export const DATE_FIELD_BY_TYPE: Record<
  IDateFilter["type"],
  "deadline" | "interviewDate" | "appliedAt"
> = {
  deadline: "deadline",
  interview: "interviewDate",
  applied: "appliedAt",
};

const inDateRange = (value: string, filter: IDateFilter): boolean => {
  const time = new Date(value).getTime();
  if (filter.from && time < new Date(filter.from).getTime()) {
    return false;
  }
  if (filter.to && time > new Date(filter.to).getTime()) {
    return false;
  }
  return true;
};

export const matchesJobDateFilters = (
  job: IJob,
  filters: IDateFilter[]
): boolean =>
  filters.length === 0 ||
  filters.some((filter) => {
    const value = job[DATE_FIELD_BY_TYPE[filter.type]];
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
