import { afterEach, describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import {
  getDateInfo,
  readFiltersFromParams,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from "@/components/jobs/jobs.helpers.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

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

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();

afterEach(() => {
  useJobsStore.setState({
    datePreset: undefined,
    dateType: "all",
    status: undefined,
  });
});

describe("status options", () => {
  it("maps every status to a label", () => {
    expect(STATUS_OPTIONS.map((option) => option.value)).toEqual(
      Object.keys(STATUS_LABEL)
    );
  });
});

describe("getDateInfo", () => {
  it("prefers a future interview date", () => {
    expect(getDateInfo(makeJob({ interviewDate: daysFromNow(5) }))).toBe(
      "5 days until interview"
    );
  });

  it("falls back to a past interview date", () => {
    const past = "2024-01-01T00:00:00.000Z";
    expect(getDateInfo(makeJob({ interviewDate: past }))).toBe(
      `Interviewed at ${new Date(past).toLocaleDateString()}`
    );
  });

  it("reports the applied date", () => {
    const applied = "2024-02-02T00:00:00.000Z";
    expect(getDateInfo(makeJob({ appliedAt: applied }))).toBe(
      `Applied ${new Date(applied).toLocaleDateString()}`
    );
  });

  it("reports deadline days left and passed deadlines", () => {
    expect(getDateInfo(makeJob({ deadline: daysFromNow(3) }))).toBe("3d left");
    expect(getDateInfo(makeJob({ deadline: daysFromNow(-3) }))).toBe(
      "Deadline passed"
    );
  });

  it("falls back to the created date", () => {
    const created = "2024-03-03T00:00:00.000Z";
    expect(getDateInfo(makeJob({ createdAt: created }))).toBe(
      `Created: ${new Date(created).toLocaleDateString()}`
    );
  });
});

describe("readFiltersFromParams", () => {
  it("sets a valid status filter", () => {
    readFiltersFromParams(new URLSearchParams("status=applied"));
    expect(useJobsStore.getState().status).toBe("applied");
  });

  it("ignores an unknown status", () => {
    readFiltersFromParams(new URLSearchParams("status=ghost"));
    expect(useJobsStore.getState().status).toBeUndefined();
  });

  it("sets a preset when both key and type are valid", () => {
    readFiltersFromParams(
      new URLSearchParams("datePreset=this-week&dateType=deadline")
    );
    expect(useJobsStore.getState().datePreset).toBe("this-week");
    expect(useJobsStore.getState().dateType).toBe("deadline");
  });

  it("ignores a preset without a valid type", () => {
    readFiltersFromParams(new URLSearchParams("datePreset=this-week"));
    expect(useJobsStore.getState().datePreset).toBeUndefined();
  });
});
