import { addHours, addMinutes, endOfDay, startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  coversWholeDay,
  DAY_END_HOUR,
  DAY_START_HOUR,
  DEFAULT_CLICK_DURATION_MINUTES,
  eventCoversDay,
  getEffectiveEndDate,
  getEventColors,
  getEventsForDay,
  getMonthGrid,
  getMonthWeekBars,
  getWeekBoundary,
  getWeekDays,
  HOUR_HEIGHT_PX,
  isAllDayEvent,
  isMidnight,
  SNAP_MINUTES,
  spansMultipleDays,
  timeToY,
  toAnchorDate,
  yToTime,
} from "@/components/dashboard/calendar/calendar.helpers.ts";
import type {
  TCustomEvent,
  TJobEvent,
} from "@/components/dashboard/calendar/calendar.types.ts";
import {
  EVENT_COLOR_OPTIONS,
  EVENT_COLORS,
} from "@/components/dashboard/calendar/calendar.types.ts";

const custom = (overrides: Partial<TCustomEvent> = {}): TCustomEvent => ({
  description: "",
  endDate: new Date(2024, 0, 1, 12),
  id: "c-1",
  source: "custom",
  startDate: new Date(2024, 0, 1, 10),
  title: "Event",
  ...overrides,
});

const jobEvent = (overrides: Partial<TJobEvent> = {}): TJobEvent => ({
  companyName: "Acme",
  date: new Date(2024, 0, 1),
  id: "j-1",
  jobId: "job-1",
  source: "deadline",
  title: "Apply",
  ...overrides,
});

describe("constants", () => {
  it("exposes the layout constants", () => {
    expect(HOUR_HEIGHT_PX).toBeGreaterThan(0);
    expect(DAY_START_HOUR).toBe(0);
    expect(DAY_END_HOUR).toBe(24);
    expect(SNAP_MINUTES).toBe(15);
    expect(DEFAULT_CLICK_DURATION_MINUTES).toBe(15);
  });
});

describe("toAnchorDate", () => {
  it("clamps the day to the last day of the month", () => {
    expect(toAnchorDate(2024, 1, 31).getDate()).toBe(29);
    expect(toAnchorDate(2023, 1, 31).getDate()).toBe(28);
    expect(toAnchorDate(2024, 0, 15).getDate()).toBe(15);
  });
});

describe("isMidnight / getEffectiveEndDate", () => {
  it("detects midnight", () => {
    expect(isMidnight(new Date(2024, 0, 1))).toBe(true);
    expect(isMidnight(new Date(2024, 0, 1, 1))).toBe(false);
  });

  it("pulls a midnight end back by one millisecond", () => {
    const end = new Date(2024, 0, 2);
    const effective = getEffectiveEndDate(custom({ endDate: end }));
    expect(effective.getTime()).toBe(end.getTime() - 1);
    expect(effective.getHours()).toBe(23);
  });

  it("keeps a non-midnight end unchanged", () => {
    const end = new Date(2024, 0, 2, 15);
    expect(getEffectiveEndDate(custom({ endDate: end }))).toBe(end);
  });
});

describe("spansMultipleDays", () => {
  it("is true only for multi-day custom events", () => {
    expect(
      spansMultipleDays(
        custom({
          endDate: new Date(2024, 0, 2, 12),
          startDate: new Date(2024, 0, 1, 10),
        })
      )
    ).toBe(true);
    expect(spansMultipleDays(custom())).toBe(false);
    expect(spansMultipleDays(jobEvent())).toBe(false);
  });
});

describe("isAllDayEvent", () => {
  it("treats midnight to last-minute ranges as all day", () => {
    expect(
      isAllDayEvent(
        custom({
          endDate: new Date(2024, 0, 1, 23, 59),
          startDate: new Date(2024, 0, 1),
        })
      )
    ).toBe(true);
    expect(
      isAllDayEvent(
        custom({
          endDate: new Date(2024, 0, 2),
          startDate: new Date(2024, 0, 1),
        })
      )
    ).toBe(true);
  });

  it("rejects non-midnight starts and job events", () => {
    expect(isAllDayEvent(custom({ startDate: new Date(2024, 0, 1, 9) }))).toBe(
      false
    );
    expect(isAllDayEvent(jobEvent())).toBe(false);
  });
});

describe("coversWholeDay", () => {
  it("matches a job event on the same day", () => {
    const day = new Date(2024, 0, 1);
    expect(coversWholeDay(jobEvent({ date: day }), day)).toBe(true);
    expect(coversWholeDay(jobEvent(), new Date(2024, 0, 2))).toBe(false);
  });

  it("matches a custom event spanning the full day", () => {
    const day = new Date(2024, 0, 1);
    expect(
      coversWholeDay(
        custom({
          endDate: endOfDay(day),
          startDate: startOfDay(day),
        }),
        day
      )
    ).toBe(true);
    expect(
      coversWholeDay(custom({ startDate: new Date(2024, 0, 1, 9) }), day)
    ).toBe(false);
  });
});

describe("getEventColors", () => {
  it("uses the custom colour when valid", () => {
    expect(getEventColors(custom({ color: "pink" }))).toEqual(
      EVENT_COLOR_OPTIONS.pink
    );
  });

  it("falls back to the source colour", () => {
    expect(getEventColors(custom({ color: undefined }))).toEqual(
      EVENT_COLORS.custom
    );
    expect(getEventColors(jobEvent({ source: "deadline" }))).toEqual(
      EVENT_COLORS.deadline
    );
  });
});

describe("eventCoversDay", () => {
  it("matches job events by day and custom events by overlap", () => {
    const day = new Date(2024, 0, 1);
    expect(eventCoversDay(jobEvent({ date: day }), day)).toBe(true);
    expect(eventCoversDay(jobEvent(), new Date(2024, 0, 3))).toBe(false);
    expect(
      eventCoversDay(
        custom({
          endDate: new Date(2024, 0, 2, 12),
          startDate: new Date(2024, 0, 1, 10),
        }),
        new Date(2024, 0, 2)
      )
    ).toBe(true);
    expect(eventCoversDay(custom(), new Date(2024, 0, 10))).toBe(false);
  });
});

describe("getMonthGrid / getEventsForDay", () => {
  it("builds whole weeks covering the month", () => {
    const grid = getMonthGrid(2024, 0);
    expect(grid.length % 7).toBe(0);
    expect(grid[0]?.getDay()).toBe(0);
    expect(
      grid.some(
        (day) => day.toDateString() === new Date(2024, 0, 1).toDateString()
      )
    ).toBe(true);
  });

  it("filters events down to the given day", () => {
    const day = new Date(2024, 0, 1);
    const events = [
      jobEvent({ date: day }),
      jobEvent({ date: new Date(2024, 0, 5), id: "j-2" }),
    ];
    expect(getEventsForDay(events, day).map((event) => event.id)).toEqual([
      "j-1",
    ]);
  });
});

describe("week helpers", () => {
  it("returns the week boundaries and days", () => {
    const anchor = new Date(2024, 0, 10);
    const { start, end } = getWeekBoundary(anchor);
    expect(start.getDay()).toBe(0);
    expect(end.getDay()).toBe(6);

    const days = getWeekDays(anchor);
    expect(days).toHaveLength(7);
    expect(days[0]?.getDay()).toBe(0);
    expect(getWeekDays(anchor, 1)[0]?.getDay()).toBe(1);
  });
});

describe("getMonthWeekBars", () => {
  it("clips multi-day events to columns and assigns lanes", () => {
    const days = getWeekDays(new Date(2024, 0, 10));
    const first = days[1] ?? new Date();
    const second = days[3] ?? new Date();
    const third = days[4] ?? new Date();

    const layouts = getMonthWeekBars(
      [
        custom({
          endDate: new Date(
            second.getFullYear(),
            second.getMonth(),
            second.getDate(),
            12
          ),
          id: "bar-1",
          startDate: first,
        }),
        custom({
          endDate: new Date(
            third.getFullYear(),
            third.getMonth(),
            third.getDate(),
            12
          ),
          id: "bar-2",
          startDate: days[2] ?? first,
        }),
        custom({ id: "single-day" }),
        jobEvent(),
      ],
      days
    );

    expect(layouts.map((layout) => layout.event.id)).toEqual([
      "bar-1",
      "bar-2",
    ]);
    expect(layouts[0]).toMatchObject({ endCol: 3, lane: 0, startCol: 1 });
    expect(layouts[1]?.lane).toBe(1);
  });

  it("returns nothing without week days", () => {
    expect(getMonthWeekBars([], [])).toEqual([]);
  });
});

describe("yToTime / timeToY", () => {
  it("snaps pixels to the nearest slot", () => {
    const day = new Date(2024, 0, 1);
    expect(yToTime(0, day)).toEqual(startOfDay(day));
    expect(yToTime(8, day)).toEqual(addMinutes(startOfDay(day), 15));
    expect(yToTime(-100, day)).toEqual(startOfDay(day));
  });

  it("clamps to the end of the day", () => {
    const day = new Date(2024, 0, 1);
    expect(yToTime(HOUR_HEIGHT_PX * 25, day)).toEqual(
      addMinutes(startOfDay(day), 24 * 60)
    );
  });

  it("converts a time back to pixels", () => {
    const day = new Date(2024, 0, 1, 2);
    expect(timeToY(day)).toBe(2 * HOUR_HEIGHT_PX);
    expect(timeToY(addHours(startOfDay(day), 1))).toBe(HOUR_HEIGHT_PX);
  });
});
