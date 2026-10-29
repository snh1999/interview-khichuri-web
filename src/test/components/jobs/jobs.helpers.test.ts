import { afterEach, describe, expect, it } from "vitest";
import type { IJob, ITrackedJob } from "@/api/jobs";
import {
  getDateInfo,
  jobPostSchema,
  parseJobLinks,
  readFiltersFromParams,
  STATUS_LABEL,
  STATUS_OPTIONS,
  serializeJobLinks,
} from "@/components/jobs/jobs.helpers.ts";
import { formatDate } from "@/lib/date.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

const makeTrack = (overrides: Partial<ITrackedJob> = {}): ITrackedJob => ({
  id: "track-1",
  jobId: "job-1",
  status: "saved",
  isFavorite: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const makeJob = (overrides: Partial<IJob> = {}): IJob => ({
  companyName: "Acme",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "",
  id: "job-1",
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
    expect(
      getDateInfo(
        makeJob({ track: makeTrack({ interviewDate: daysFromNow(5) }) })
      )
    ).toBe("5 days until interview");
  });

  it("falls back to a past interview date", () => {
    const past = "2024-01-01T00:00:00.000Z";
    expect(
      getDateInfo(makeJob({ track: makeTrack({ interviewDate: past }) }))
    ).toBe(`Interviewed at ${formatDate(past)}`);
  });

  it("reports the applied date", () => {
    const applied = "2024-02-02T00:00:00.000Z";
    expect(
      getDateInfo(makeJob({ track: makeTrack({ appliedAt: applied }) }))
    ).toBe(`Applied ${formatDate(applied)}`);
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
      `Created: ${formatDate(created)}`
    );
  });
});

describe("jobPostSchema URLs", () => {
  const base = {
    companyName: "Acme",
    description: "A sufficiently long job description.",
    status: "saved" as const,
    title: "Frontend",
    topicIds: [],
  };

  it("accepts http(s) links and URL", () => {
    expect(
      jobPostSchema.safeParse({
        ...base,
        url: "https://acme.com/jobs/1",
        links: [{ value: "https://acme.com/jobs/1", label: "Posting" }],
      }).success
    ).toBe(true);
  });

  it("rejects unsafe or malformed URLs", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "not a url",
    ]) {
      expect(jobPostSchema.safeParse({ ...base, url }).success).toBe(false);
      expect(
        jobPostSchema.safeParse({ ...base, links: [{ value: url }] }).success
      ).toBe(false);
    }
  });

  it("allows an empty URL and empty link rows", () => {
    expect(jobPostSchema.safeParse({ ...base, url: "" }).success).toBe(true);
    expect(
      jobPostSchema.safeParse({ ...base, links: [{ value: "" }] }).success
    ).toBe(true);
  });
});

describe("parseJobLinks", () => {
  it("parses stored JSON links with labels", () => {
    expect(
      parseJobLinks(
        JSON.stringify([
          { url: "https://acme.com/a", label: "A" },
          { url: "https://acme.com/b" },
        ])
      )
    ).toEqual([
      { url: "https://acme.com/a", label: "A" },
      { url: "https://acme.com/b", label: null },
    ]);
  });

  it("falls back to trimmed newline-separated links", () => {
    expect(
      parseJobLinks(" https://acme.com/a \n\nhttps://acme.com/b ")
    ).toEqual([
      { url: "https://acme.com/a", label: null },
      { url: "https://acme.com/b", label: null },
    ]);
  });

  it("drops unsafe and malformed entries", () => {
    expect(
      parseJobLinks(
        JSON.stringify([
          { url: "javascript:alert(1)" },
          { url: 42 },
          { url: "https://acme.com/ok" },
        ])
      )
    ).toEqual([{ url: "https://acme.com/ok", label: null }]);
  });

  it("returns an empty list for empty input", () => {
    expect(parseJobLinks(null)).toEqual([]);
    expect(parseJobLinks("")).toEqual([]);
  });
});

describe("serializeJobLinks", () => {
  it("trims URLs and labels before storing", () => {
    expect(
      serializeJobLinks([{ value: " https://acme.com/a ", label: " A " }])
    ).toBe(JSON.stringify([{ url: "https://acme.com/a", label: "A" }]));
  });

  it("drops blank and unsafe entries, returning null when empty", () => {
    expect(serializeJobLinks([{ value: "   " }])).toBeNull();
    expect(serializeJobLinks([{ value: "javascript:alert(1)" }])).toBeNull();
    expect(serializeJobLinks(null)).toBeNull();
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
