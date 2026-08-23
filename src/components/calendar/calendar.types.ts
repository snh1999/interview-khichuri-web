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
  description?: string | null;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
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

export interface TDrawerPrefill {
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
}
