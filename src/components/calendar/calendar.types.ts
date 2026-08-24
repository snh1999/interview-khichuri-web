import type { TEventSource } from "@/api/calendar";

export type TViewMode = "month" | "week" | "day";

interface IBasic {
  id: string;
  title: string;
  source: TEventSource;
}

export interface TJobEvent extends IBasic {
  jobId: string;
  companyName: string;
  date: Date;
}

export interface TCustomEvent extends IBasic {
  description: string;
  startDate: Date;
  endDate: Date;
  color?: string | null;
  isSynced?: boolean;
  privateSync?: boolean;
  googleTitle?: string | null;
}

export type TEventVisibility = Record<TEventSource, boolean>;

export const EVENT_COLORS: Record<
  TEventSource,
  { bg: string; text: string; dot: string }
> = {
  applied: {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    dot: "bg-secondary",
  },
  custom: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  deadline: {
    bg: "bg-destructive/50",
    text: "text-destructive-foreground",
    dot: "bg-destructive",
  },
  interview: {
    bg: "bg-primary/80",
    text: "text-primary-foreground",
    dot: "bg-primary",
  },
} as const;

export const EVENT_LABELS: Record<TEventSource, string> = {
  applied: "Applied at",
  custom: "",
  deadline: "Application deadline",
  interview: "Interview",
} as const;

/**
 * User-selectable colors for custom events only — job-event source colors
 * stay reserved. Keys persist in the DB; class pairs are hand-picked for
 * readable text in both light and dark themes.
 */
export const EVENT_COLOR_KEYS = [
  "rose",
  "amber",
  "emerald",
  "sky",
  "violet",
  "fuchsia",
] as const;

export type TEventColor = (typeof EVENT_COLOR_KEYS)[number];

export const EVENT_COLOR_OPTIONS: Record<
  TEventColor,
  { bg: string; text: string; dot: string }
> = {
  rose: {
    bg: "bg-rose-100 dark:bg-rose-950/70",
    dot: "bg-rose-500",
    text: "text-rose-800 dark:text-rose-200",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-950/70",
    dot: "bg-amber-500",
    text: "text-amber-800 dark:text-amber-200",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-950/70",
    dot: "bg-emerald-500",
    text: "text-emerald-800 dark:text-emerald-200",
  },
  sky: {
    bg: "bg-sky-100 dark:bg-sky-950/70",
    dot: "bg-sky-500",
    text: "text-sky-800 dark:text-sky-200",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-950/70",
    dot: "bg-violet-500",
    text: "text-violet-800 dark:text-violet-200",
  },
  fuchsia: {
    bg: "bg-fuchsia-100 dark:bg-fuchsia-950/70",
    dot: "bg-fuchsia-500",
    text: "text-fuchsia-800 dark:text-fuchsia-200",
  },
} as const;

export interface TDrawerPrefill {
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
}
