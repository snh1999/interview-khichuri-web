import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { TCustomEvent, TJobEvent } from "./calendar.types";
import {
  EVENT_COLOR_OPTIONS,
  EVENT_COLORS,
  type TEventColor,
} from "./calendar.types";

export const HOUR_HEIGHT_PX = 48;
export const SNAP_MINUTES = 15;
export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24;
export const DEFAULT_CLICK_DURATION_MINUTES = 15;

export const toAnchorDate = (
  year: number,
  month: number,
  day: number
): Date => {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfMonth));
};

export const isMidnight = (date: Date): boolean =>
  date.getHours() === 0 &&
  date.getMinutes() === 0 &&
  date.getSeconds() === 0 &&
  date.getMilliseconds() === 0;

/**
 * An event ending exactly at midnight occupies zero time on the next day;
 * treat its visual end as the last millisecond of the previous day.
 */
export const getEffectiveEndDate = (event: TCustomEvent): Date =>
  isMidnight(event.endDate)
    ? new Date(event.endDate.getTime() - 1)
    : event.endDate;

export const spansMultipleDays = (event: TJobEvent | TCustomEvent): boolean =>
  "startDate" in event &&
  !isSameDay(event.startDate, getEffectiveEndDate(event));

const isLastMinuteOfDay = (date: Date): boolean =>
  date.getHours() === 23 && date.getMinutes() >= 59;

/**
 * The backend has no all-day column, so nothing persists the flag.
 *  "All day" is 00:00 → 23:59 timestamps;
 */
export const isAllDayEvent = (event: TJobEvent | TCustomEvent): boolean => {
  if (!("startDate" in event && isMidnight(event.startDate))) {
    return false;
  }
  // Tolerate the last minute of the day (23:59:00 …) plus legacy
  // midnight-capped ranges saved before the 23:59 convention.
  return isMidnight(event.endDate) || isLastMinuteOfDay(event.endDate);
};

/**
 * Whether the event occupies the entire given day (00:00 → last minute).
 * Used to lift fully-covered days of otherwise timed multi-day events into
 * the all-day row while partial days stay in the time grid.
 */
export const coversWholeDay = (
  event: TJobEvent | TCustomEvent,
  day: Date
): boolean => {
  if ("date" in event) {
    return isSameDay(event.date, day);
  }
  // Must have started no later than this day's 00:00…
  if (event.startDate.getTime() > startOfDay(day).getTime()) {
    return false;
  }
  // …and run through this day's end: either past it entirely, or up to
  // the last minute OF this very day.
  return (
    event.endDate.getTime() >= endOfDay(day).getTime() ||
    (isSameDay(event.endDate, day) && isLastMinuteOfDay(event.endDate))
  );
};

/**
 * User-chosen color wins for custom events; job-event source colors stay
 * reserved. Unknown/stale keys fall back to the source color.
 */
export const getEventColors = (
  event: TJobEvent | TCustomEvent
): { bg: string; text: string; dot: string } => {
  const color =
    "startDate" in event && event.source === "custom" ? event.color : null;
  if (color && color in EVENT_COLOR_OPTIONS) {
    return EVENT_COLOR_OPTIONS[color as TEventColor];
  }
  return EVENT_COLORS[event.source];
};

export const eventCoversDay = (
  event: TJobEvent | TCustomEvent,
  day: Date
): boolean => {
  if ("date" in event) {
    return isSameDay(event.date, day);
  }
  const rangeStart = startOfDay(day);
  const rangeEnd = endOfDay(day);
  const end = getEffectiveEndDate(event);
  return !(isBefore(end, rangeStart) || isAfter(event.startDate, rangeEnd));
};

export const getMonthGrid = (year: number, month: number): Date[] => {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
};

export const getEventsForDay = (
  events: (TJobEvent | TCustomEvent)[],
  day: Date
): (TJobEvent | TCustomEvent)[] =>
  events.filter((event) => eventCoversDay(event, day));

export const getWeekDays = (anchor: Date, weekStartsOn: 0 | 1 = 0): Date[] => {
  const start = startOfWeek(anchor, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const MONTH_BAR_AREA_TOP_PX = 30;
export const MONTH_BAR_ROW_HEIGHT_PX = 20;
export const MONTH_BAR_ROW_GAP_PX = 4;

const MS_PER_DAY = 86_400_000;

export interface TMonthBarLayout {
  event: TCustomEvent;
  startCol: number;
  endCol: number;
  lane: number;
}

export const getMonthWeekBars = (
  events: (TJobEvent | TCustomEvent)[],
  weekDays: Date[]
): TMonthBarLayout[] => {
  const lastWeekDay = weekDays.at(-1);
  if (!lastWeekDay) {
    return [];
  }
  const viewStart = startOfDay(weekDays[0]);
  const viewEnd = endOfDay(lastWeekDay);

  const dayIndexOf = (date: Date) =>
    Math.max(
      0,
      Math.min(
        weekDays.length - 1,
        Math.round(
          (startOfDay(date).getTime() - viewStart.getTime()) / MS_PER_DAY
        )
      )
    );

  const clipped = events
    .filter((event): event is TCustomEvent => !("date" in event))
    .filter((event) => spansMultipleDays(event))
    .filter((event) => {
      const end = getEffectiveEndDate(event);
      return !(isBefore(end, viewStart) || isAfter(event.startDate, viewEnd));
    })
    .map((event) => {
      const end = getEffectiveEndDate(event);
      return {
        event,
        startCol: dayIndexOf(event.startDate),
        endCol: dayIndexOf(isAfter(end, viewEnd) ? viewEnd : end),
      };
    })
    .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

  // Greedy interval partitioning per run of overlapping bars.
  const layouts: TMonthBarLayout[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;

  for (const bar of clipped) {
    if (bar.startCol > clusterEnd) {
      laneEnds = [];
    }
    let lane = laneEnds.findIndex((end) => end < bar.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
    }
    laneEnds[lane] = bar.endCol;
    clusterEnd = Math.max(clusterEnd, bar.endCol);
    layouts.push({ ...bar, lane });
  }

  return layouts;
};

export const yToTime = (y: number, day: Date): Date => {
  const totalMinutes = (y / HOUR_HEIGHT_PX) * 60;
  const snapped = Math.round(totalMinutes / SNAP_MINUTES) * SNAP_MINUTES;
  const clamped = Math.max(0, Math.min(24 * 60, snapped));
  const result = new Date(day);
  result.setHours(0, clamped, 0, 0);
  return result;
};

export const timeToY = (date: Date): number => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return (minutes / 60) * HOUR_HEIGHT_PX;
};
