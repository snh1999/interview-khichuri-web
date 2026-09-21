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
  color?: TEventColor | null;
  // isSynced?: boolean;
  // privateSync?: boolean;
  // googleTitle?: string | null;
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
  "pink",
  "cyan",
  "indigo",
  "sky",
  "violet",
  "fuchsia",
] as const;

export type TEventColor = (typeof EVENT_COLOR_KEYS)[number];

export const EVENT_COLOR_OPTIONS: Record<
  TEventColor,
  { bg: string; text: string; dot: string }
> = {
  pink: {
    bg: "bg-pink-100 dark:bg-pink-950/70",
    dot: "bg-pink-500",
    text: "text-pink-800 dark:text-pink-200",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-950/70",
    dot: "bg-cyan-500",
    text: "text-cyan-800 dark:text-cyan-200",
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-950/70",
    dot: "bg-indigo-500",
    text: "text-indigo-800 dark:text-indigo-200",
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
