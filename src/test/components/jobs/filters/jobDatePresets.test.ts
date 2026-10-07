import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import {
  buildDateFiltersForType,
  DATE_TYPE_SELECTIONS,
  getDatePreset,
  JOB_DATE_PRESETS,
  matchesJobDateFilters,
  resolveDateFilters,
} from "@/components/jobs/filters/jobDatePresets.ts";

const makeJob = (overrides: Partial<IJob> = {}): IJob => ({
  companyName: "Acme",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "",
  id: "job-1",
  status: "saved",
  title: "Frontend Engineer",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("buildDateFiltersForType", () => {
  it("expands all into the three concrete types", () => {
    expect(buildDateFiltersForType("all", "a", "b")).toEqual([
      { type: "deadline", from: "a", to: "b" },
      { type: "interview", from: "a", to: "b" },
      { type: "applied", from: "a", to: "b" },
    ]);
  });

  it("keeps a specific type as a single filter", () => {
    expect(buildDateFiltersForType("deadline", undefined, undefined)).toEqual([
      { type: "deadline", from: undefined, to: undefined },
    ]);
  });
});

describe("JOB_DATE_PRESETS", () => {
  it("exposes one preset per key and label", () => {
    expect(DATE_TYPE_SELECTIONS).toContain("all");
    expect(JOB_DATE_PRESETS.map((preset) => preset.key)).toEqual([
      "this-week",
      "this-month",
      "last-month",
      "this-year",
    ]);
  });

  it("builds a window for each preset", () => {
    const now = new Date(2024, 5, 15);
    const week = getDatePreset("this-week")?.getFilter(now, "interview");
    expect(week).toEqual([
      {
        type: "interview",
        from: startOfWeek(now).toISOString(),
        to: endOfWeek(now).toISOString(),
      },
    ]);

    const month = getDatePreset("this-month")?.getFilter(now, "deadline");
    expect(month?.[0]?.from).toBe(startOfMonth(now).toISOString());
    expect(month?.[0]?.to).toBe(endOfMonth(now).toISOString());
  });

  it("finds presets by key and tolerates unknown keys", () => {
    expect(getDatePreset("this-year")?.label).toBe("This year");
    expect(getDatePreset("nope")).toBeUndefined();
    expect(getDatePreset(null)).toBeUndefined();
  });
});

describe("matchesJobDateFilters", () => {
  it("matches everything with no filters", () => {
    expect(matchesJobDateFilters(makeJob(), [])).toBe(true);
  });

  it("checks the field for each filter type", () => {
    const job = makeJob({ appliedAt: "2024-06-15T00:00:00.000Z" });

    expect(
      matchesJobDateFilters(job, [
        { type: "applied", from: "2024-06-01", to: "2024-06-30" },
      ])
    ).toBe(true);
    expect(
      matchesJobDateFilters(job, [
        { type: "applied", from: "2024-07-01", to: "2024-07-31" },
      ])
    ).toBe(false);
    expect(
      matchesJobDateFilters(job, [{ type: "deadline", from: "2024-01-01" }])
    ).toBe(false);
  });

  it("matches when any of several filters matches", () => {
    const job = makeJob({ deadline: "2024-06-10T00:00:00.000Z" });

    expect(
      matchesJobDateFilters(job, [
        { type: "interview" },
        { type: "deadline", to: "2024-06-30" },
      ])
    ).toBe(true);
  });
});

describe("resolveDateFilters", () => {
  it("returns nothing without a preset or custom range", () => {
    expect(
      resolveDateFilters({
        dateFrom: undefined,
        datePreset: undefined,
        dateTo: undefined,
        dateType: "all",
      })
    ).toEqual([]);
  });

  it("uses the custom range when no preset is set", () => {
    expect(
      resolveDateFilters({
        dateFrom: "2024-01-01",
        datePreset: undefined,
        dateTo: "2024-01-31",
        dateType: "deadline",
      })
    ).toEqual([{ type: "deadline", from: "2024-01-01", to: "2024-01-31" }]);
  });

  it("prefers the preset window when one is set", () => {
    const filters = resolveDateFilters({
      dateFrom: "2024-01-01",
      datePreset: "this-week",
      dateTo: "2024-01-31",
      dateType: "deadline",
    });

    expect(filters).toHaveLength(1);
    expect(filters[0]?.type).toBe("deadline");
  });
});
